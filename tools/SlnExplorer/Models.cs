using System.Text.Json.Serialization;

namespace SlnExplorer;

public sealed class ExplorerNode
{
    public required string Name { get; init; }
    public required string Type { get; init; }
    public string? Path { get; init; }
    public string? Status { get; set; }
    public string? Warning { get; set; }
    public Dictionary<string, string?> Properties { get; } = new(StringComparer.OrdinalIgnoreCase);
    public List<ExplorerNode> Children { get; } = [];
}

public sealed class ExplorerOptions
{
    public required string SolutionPath { get; init; }
    public string Format { get; init; } = "tree";
    public string Configuration { get; init; } = "Debug";
    public string Platform { get; init; } = "AnyCPU";
    public bool Strict { get; init; }
    public bool NoEvaluate { get; init; }
    public bool IncludeFilesystem { get; init; } = true;
}

public enum EvaluationMode
{
    Evaluated,
    EvaluatedWithStubs,
    FilesystemFallback,
    Failed
}

public sealed class ProjectReadResult
{
    public required ExplorerNode Node { get; init; }
    public required EvaluationMode Mode { get; init; }
    public string? Warning { get; init; }
}
