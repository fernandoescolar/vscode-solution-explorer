namespace SlnExplorer;

public static class StubTargets
{
    private static readonly Lazy<string> Root = new(CreateStubTree);

    public static string Create() => Root.Value;

    private static string CreateStubTree()
    {
        var root = Path.Combine(Path.GetTempPath(), "slnexplorer-msbuild-stubs", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        var vs17 = Path.Combine(root, "Microsoft", "VisualStudio", "v17.0");
        WriteStub(Path.Combine(vs17, "WebApplications", "Microsoft.WebApplication.targets"));
        WriteStub(Path.Combine(vs17, "Web", "Microsoft.Web.Publishing.targets"));
        WriteStub(Path.Combine(vs17, "TypeScript", "Microsoft.TypeScript.targets"));
        WriteStub(Path.Combine(vs17, "CodeAnalysis", "Microsoft.CodeAnalysis.targets"));
        WriteStub(Path.Combine(vs17, "TextTemplating", "Microsoft.TextTemplating.targets"));
        WriteStub(Path.Combine(root, "Microsoft", "Common", "Microsoft.Common.targets"));
        WriteStub(Path.Combine(root, "Microsoft", "VisualStudio", "Managed", "Microsoft.Managed.targets"));

        return root;
    }

    private static void WriteStub(string path)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, StubXml);
    }

    private const string StubXml = """
<Project xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup>
    <SlnExplorerUsingStubTargets>true</SlnExplorerUsingStubTargets>
  </PropertyGroup>

  <!-- These targets intentionally do nothing. They are only for design-time inspection. -->
  <Target Name="Build" />
  <Target Name="Clean" />
  <Target Name="Rebuild" />
  <Target Name="Restore" />
  <Target Name="ResolveReferences" />
  <Target Name="ResolveAssemblyReferences" />
  <Target Name="ResolveProjectReferences" />
  <Target Name="AssignTargetPaths" />
  <Target Name="GetTargetPath" Returns="@(TargetPath)" />
  <Target Name="GetCopyToOutputDirectoryItems" Returns="@(AllItemsFullPathWithTargetPath)" />
  <Target Name="CoreCompile" />
  <Target Name="Compile" />
  <Target Name="CoreBuild" />
  <Target Name="_CheckForInvalidConfigurationAndPlatform" />
</Project>
""";
}
