using System.Text.Json;
using Microsoft.Build.Locator;

namespace SlnExplorer;

public static class Program
{
    public static int Main(string[] args)
    {
        try
        {
            var options = ParseArgs(args);
            if (options is null) return 2;

            RegisterMsBuildIfPossible();

            var explorer = new SolutionExplorer(options);
            var root = explorer.Explore();

            if (options.Format.Equals("json", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine(JsonSerializer.Serialize(root, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
                }));
            }
            else
            {
                TreePrinter.Print(root);
            }

            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("slnexplorer failed: " + ex.Message);
            if (Environment.GetEnvironmentVariable("SLNEXPLORER_DEBUG") == "1")
                Console.Error.WriteLine(ex);
            return 1;
        }
    }

    private static void RegisterMsBuildIfPossible()
    {
        if (MSBuildLocator.IsRegistered) return;
        try
        {
            MSBuildLocator.RegisterDefaults();
        }
        catch
        {
            // No .NET SDK / Build Tools found. The fallback path can still parse XML + filesystem.
        }
    }

    private static ExplorerOptions? ParseArgs(string[] args)
    {
        if (args.Length == 0 || args.Contains("--help"))
        {
            Console.WriteLine("Usage: slnexplorer <solution.sln> [--format tree|json] [--configuration Debug] [--platform AnyCPU] [--strict] [--no-evaluate]");
            return null;
        }

        string? sln = null;
        var format = "tree";
        var configuration = "Debug";
        var platform = "AnyCPU";
        var strict = false;
        var noEvaluate = false;

        for (var i = 0; i < args.Length; i++)
        {
            switch (args[i])
            {
                case "--format": format = args[++i]; break;
                case "--configuration": configuration = args[++i]; break;
                case "--platform": platform = args[++i]; break;
                case "--strict": strict = true; break;
                case "--no-evaluate": noEvaluate = true; break;
                default:
                    sln ??= args[i];
                    break;
            }
        }

        if (sln is null || !File.Exists(sln))
        {
            Console.Error.WriteLine("Solution file not found.");
            return null;
        }

        return new ExplorerOptions
        {
            SolutionPath = Path.GetFullPath(sln),
            Format = format,
            Configuration = configuration,
            Platform = platform,
            Strict = strict,
            NoEvaluate = noEvaluate
        };
    }
}
