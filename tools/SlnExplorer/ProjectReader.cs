using System.Xml.Linq;
using Microsoft.Build.Definition;
using Microsoft.Build.Evaluation;
using Microsoft.Build.Exceptions;
using Microsoft.Build.Execution;

namespace SlnExplorer;

public sealed class ProjectReader(ExplorerOptions options)
{
    public ProjectReadResult Read(string projectPath, string displayName)
    {
        if (!options.NoEvaluate)
        {
            var strict = TryEvaluate(projectPath, displayName, withStubs: false, ignoreMissingImports: false);
            if (strict is not null) return strict;
            if (options.Strict) throw new InvalidOperationException($"Could not evaluate {projectPath} in strict mode.");

            var stubbed = TryEvaluate(projectPath, displayName, withStubs: true, ignoreMissingImports: true);
            if (stubbed is not null) return stubbed;
        }

        return ReadFromXmlAndFilesystem(projectPath, displayName, warning: "MSBuild evaluation failed or was disabled; using XML + filesystem fallback.");
    }

    private ProjectReadResult? TryEvaluate(string projectPath, string displayName, bool withStubs, bool ignoreMissingImports)
    {
        try
        {
            var globals = BuildGlobalProperties(withStubs ? StubTargets.Create() : null);
            using var pc = new ProjectCollection(globals);
            var loadSettings = ignoreMissingImports
                ? Microsoft.Build.Evaluation.ProjectLoadSettings.IgnoreMissingImports
                : Microsoft.Build.Evaluation.ProjectLoadSettings.Default;

            var project = Project.FromFile(projectPath, new ProjectOptions
            {
                GlobalProperties = globals,
                ProjectCollection = pc,
                LoadSettings = loadSettings
            });

            var node = BuildNodeFromEvaluatedProject(project, displayName, projectPath);
            return new ProjectReadResult
            {
                Node = node,
                Mode = withStubs ? EvaluationMode.EvaluatedWithStubs : EvaluationMode.Evaluated,
                Warning = withStubs ? "Some missing imports may have been ignored or redirected to local stubs." : null
            };
        }
        catch (InvalidProjectFileException)
        {
            return null;
        }
        catch (Exception)
        {
            return null;
        }
    }

    private Dictionary<string, string> BuildGlobalProperties(string? stubRoot)
    {
        var globals = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Configuration"] = options.Configuration,
            ["Platform"] = options.Platform,
            ["DesignTimeBuild"] = "true",
            ["SkipCompilerExecution"] = "true",
            ["ProvideCommandLineArgs"] = "true",
            ["BuildingInsideVisualStudio"] = "true"
        };

        if (stubRoot is not null)
        {
            globals["VisualStudioVersion"] = "17.0";
            globals["VSToolsPath"] = Path.Combine(stubRoot, "Microsoft", "VisualStudio", "v17.0");
            globals["MSBuildExtensionsPath"] = stubRoot;
            globals["MSBuildExtensionsPath32"] = stubRoot;
            globals["MSBuildExtensionsPath64"] = stubRoot;
        }

        return globals;
    }

    private static ExplorerNode BuildNodeFromEvaluatedProject(Project project, string displayName, string projectPath)
    {
        var node = new ExplorerNode
        {
            Name = displayName,
            Type = "project",
            Path = projectPath
        };

        AddProperty(node, "TargetFramework", project.GetPropertyValue("TargetFramework"));
        AddProperty(node, "TargetFrameworks", project.GetPropertyValue("TargetFrameworks"));
        AddProperty(node, "Sdk", project.GetPropertyValue("MSBuildProjectSdk"));
        AddProperty(node, "OutputType", project.GetPropertyValue("OutputType"));

        var files = new ExplorerNode { Name = "Files", Type = "folder" };
        foreach (var itemType in new[] { "Compile", "Content", "None", "EmbeddedResource", "Page", "ApplicationDefinition" })
        {
            foreach (var item in project.GetItems(itemType))
            {
                var include = item.EvaluatedInclude;
                if (string.IsNullOrWhiteSpace(include)) continue;
                if (IsGeneratedOrBuildOutput(include)) continue;
                AddPath(files, include, "file", itemType);
            }
        }
        if (files.Children.Count > 0) node.Children.Add(files);

        var deps = new ExplorerNode { Name = "Dependencies", Type = "dependencyGroup" };
        AddItems(deps, "Packages", "package", project.GetItems("PackageReference"), i =>
        {
            var version = i.GetMetadataValue("Version");
            return string.IsNullOrWhiteSpace(version) ? i.EvaluatedInclude : $"{i.EvaluatedInclude} {version}";
        });
        AddItems(deps, "Central Package Versions", "packageVersion", project.GetItems("PackageVersion"), i =>
        {
            var version = i.GetMetadataValue("Version");
            return string.IsNullOrWhiteSpace(version) ? i.EvaluatedInclude : $"{i.EvaluatedInclude} {version}";
        });
        AddItems(deps, "Projects", "projectReference", project.GetItems("ProjectReference"), i => i.EvaluatedInclude);
        AddItems(deps, "Frameworks", "frameworkReference", project.GetItems("FrameworkReference"), i => i.EvaluatedInclude);
        AddItems(deps, "Assemblies", "assemblyReference", project.GetItems("Reference"), i => i.EvaluatedInclude);
        if (deps.Children.Count > 0) node.Children.Add(deps);

        return node;
    }

    private ProjectReadResult ReadFromXmlAndFilesystem(string projectPath, string displayName, string warning)
    {
        var node = new ExplorerNode
        {
            Name = displayName,
            Type = "project",
            Path = projectPath,
            Warning = warning
        };

        try
        {
            var doc = XDocument.Load(projectPath);
            var root = doc.Root!;
            var ns = root.Name.Namespace;

            var props = root.Descendants(ns + "PropertyGroup").Descendants().ToList();
            AddProperty(node, "TargetFramework", props.FirstOrDefault(e => e.Name.LocalName == "TargetFramework")?.Value);
            AddProperty(node, "TargetFrameworks", props.FirstOrDefault(e => e.Name.LocalName == "TargetFrameworks")?.Value);
            AddProperty(node, "Sdk", root.Attribute("Sdk")?.Value);
            AddProperty(node, "OutputType", props.FirstOrDefault(e => e.Name.LocalName == "OutputType")?.Value);

            var files = new ExplorerNode { Name = "Files", Type = "folder" };
            foreach (var itemType in new[] { "Compile", "Content", "None", "EmbeddedResource", "Page", "ApplicationDefinition" })
            {
                foreach (var e in root.Descendants(ns + itemType))
                {
                    var include = (string?)e.Attribute("Include") ?? (string?)e.Attribute("Update");
                    if (!string.IsNullOrWhiteSpace(include) && !include.Contains('*'))
                        AddPath(files, include, "file", itemType);
                }
            }

            if (options.IncludeFilesystem)
            {
                var dir = Path.GetDirectoryName(projectPath)!;
                foreach (var file in Directory.EnumerateFiles(dir, "*", SearchOption.AllDirectories))
                {
                    if (ShouldSkipFile(file, dir)) continue;
                    var rel = Path.GetRelativePath(dir, file);
                    AddPath(files, rel, "file", "Filesystem");
                }
            }
            if (files.Children.Count > 0) node.Children.Add(files);

            var deps = new ExplorerNode { Name = "Dependencies", Type = "dependencyGroup" };
            AddXmlItems(deps, root, ns, "PackageReference", "Packages", "package");
            AddXmlItems(deps, root, ns, "PackageVersion", "Central Package Versions", "packageVersion");
            AddXmlItems(deps, root, ns, "ProjectReference", "Projects", "projectReference");
            AddXmlItems(deps, root, ns, "FrameworkReference", "Frameworks", "frameworkReference");
            AddXmlItems(deps, root, ns, "Reference", "Assemblies", "assemblyReference");
            if (deps.Children.Count > 0) node.Children.Add(deps);
        }
        catch (Exception ex)
        {
            node.Warning = warning + " XML parse also failed: " + ex.Message;
        }

        return new ProjectReadResult
        {
            Node = node,
            Mode = EvaluationMode.FilesystemFallback,
            Warning = node.Warning
        };
    }

    private static void AddXmlItems(ExplorerNode parent, XElement root, XNamespace ns, string itemName, string groupName, string type)
    {
        var group = new ExplorerNode { Name = groupName, Type = "folder" };
        foreach (var e in root.Descendants(ns + itemName))
        {
            var include = (string?)e.Attribute("Include") ?? (string?)e.Attribute("Update");
            if (string.IsNullOrWhiteSpace(include)) continue;
            var version = (string?)e.Attribute("Version");
            group.Children.Add(new ExplorerNode
            {
                Name = string.IsNullOrWhiteSpace(version) ? include : $"{include} {version}",
                Type = type,
                Path = include
            });
        }
        if (group.Children.Count > 0) parent.Children.Add(group);
    }

    private static void AddItems(ExplorerNode parent, string groupName, string type, ICollection<Microsoft.Build.Evaluation.ProjectItem> items, Func<Microsoft.Build.Evaluation.ProjectItem, string> name)
    {
        var group = new ExplorerNode { Name = groupName, Type = "folder" };
        foreach (var item in items)
        {
            var n = name(item);
            if (string.IsNullOrWhiteSpace(n)) continue;
            group.Children.Add(new ExplorerNode { Name = n, Type = type, Path = item.EvaluatedInclude });
        }
        if (group.Children.Count > 0) parent.Children.Add(group);
    }

    private static void AddProperty(ExplorerNode node, string key, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value)) node.Properties[key] = value;
    }

    private static void AddPath(ExplorerNode root, string relativePath, string leafType, string itemType)
    {
        var parts = relativePath.Replace('\\', '/').Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return;

        var current = root;
        for (var i = 0; i < parts.Length; i++)
        {
            var isLeaf = i == parts.Length - 1;
            var existing = current.Children.FirstOrDefault(c => c.Name.Equals(parts[i], StringComparison.OrdinalIgnoreCase));
            if (existing is null)
            {
                existing = new ExplorerNode
                {
                    Name = parts[i],
                    Type = isLeaf ? leafType : "folder",
                    Path = relativePath
                };
                if (isLeaf) existing.Properties["ItemType"] = itemType;
                current.Children.Add(existing);
            }
            current = existing;
        }
    }

    private static bool IsGeneratedOrBuildOutput(string path)
    {
        var normalized = path.Replace('\\', '/');
        return normalized.StartsWith("obj/", StringComparison.OrdinalIgnoreCase)
               || normalized.StartsWith("bin/", StringComparison.OrdinalIgnoreCase);
    }

    private static bool ShouldSkipFile(string file, string root)
    {
        var rel = Path.GetRelativePath(root, file).Replace('\\', '/');
        return rel.StartsWith("bin/", StringComparison.OrdinalIgnoreCase)
               || rel.StartsWith("obj/", StringComparison.OrdinalIgnoreCase)
               || rel.StartsWith(".git/", StringComparison.OrdinalIgnoreCase)
               || rel.StartsWith(".vs/", StringComparison.OrdinalIgnoreCase)
               || rel.EndsWith(".user", StringComparison.OrdinalIgnoreCase);
    }
}
