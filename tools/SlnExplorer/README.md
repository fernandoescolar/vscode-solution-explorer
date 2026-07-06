# SlnExplorer

Experimental .NET CLI for generating a Solution Explorer-style view from a `.sln` file.

## Strategy

1. Evaluate the project with real MSBuild.
2. If it fails because of missing imports or targets, retry with design-time properties, `IgnoreMissingImports`, and local stubs for common Visual Studio targets.
3. If it still fails, fall back to XML + filesystem.

The goal is inspection, not compilation. The stubs do not replace a real toolchain.

## Usage

```bash
dotnet run --project src/SlnExplorer -- ./MySolution.sln --format tree

dotnet run --project src/SlnExplorer -- ./MySolution.sln --format json
```

Opciones:

```bash
--configuration Debug|Release
--platform AnyCPU
--strict          # do not fall back if MSBuild fails
--no-evaluate     # force XML + filesystem
```

## Linux

It works on Linux for SDK-style projects as long as the .NET SDK is installed. Projects that depend on proprietary Visual Studio targets degrade to partial evaluation or filesystem fallback.
