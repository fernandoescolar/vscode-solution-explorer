using Microsoft.Build.Construction;

namespace SlnExplorer;

public sealed class SolutionExplorer(ExplorerOptions options)
{
    public ExplorerNode Explore()
    {
        var solution = SolutionFile.Parse(options.SolutionPath);
        var root = new ExplorerNode
        {
            Name = Path.GetFileNameWithoutExtension(options.SolutionPath),
            Type = "solution",
            Path = options.SolutionPath
        };

        var byGuid = new Dictionary<string, ExplorerNode>(StringComparer.OrdinalIgnoreCase);
        var pendingParent = new List<(ExplorerNode Node, string? ParentGuid)>();
        var reader = new ProjectReader(options);

        foreach (var p in solution.ProjectsInOrder)
        {
            ExplorerNode node;
            if (p.ProjectType == SolutionProjectType.SolutionFolder)
            {
                node = new ExplorerNode
                {
                    Name = p.ProjectName,
                    Type = "solutionFolder",
                    Path = p.RelativePath
                };
            }
            else if (p.ProjectType == SolutionProjectType.KnownToBeMSBuildFormat && File.Exists(p.AbsolutePath))
            {
                var result = reader.Read(p.AbsolutePath, p.ProjectName);
                node = result.Node;
                node.Status = result.Mode switch
                {
                    EvaluationMode.Evaluated => "evaluated",
                    EvaluationMode.EvaluatedWithStubs => "evaluated-with-stubs",
                    EvaluationMode.FilesystemFallback => "filesystem-fallback",
                    _ => "failed"
                };
                node.Warning = result.Warning;
            }
            else
            {
                node = new ExplorerNode
                {
                    Name = p.ProjectName,
                    Type = "unsupportedProject",
                    Path = p.AbsolutePath,
                    Status = "unsupported"
                };
            }

            if (!string.IsNullOrWhiteSpace(p.ProjectGuid))
                byGuid[p.ProjectGuid] = node;

            pendingParent.Add((node, p.ParentProjectGuid));
        }

        foreach (var item in pendingParent)
        {
            if (!string.IsNullOrWhiteSpace(item.ParentGuid) && byGuid.TryGetValue(item.ParentGuid, out var parent))
                parent.Children.Add(item.Node);
            else
                root.Children.Add(item.Node);
        }

        return root;
    }
}
