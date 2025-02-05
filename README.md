
> **⚠️ Please note, while there is another extension offering a solution explorer for Visual Studio Code, it's important to clarify that this is not the official Microsoft extension. For the official extension, you can visit [this link](https://code.visualstudio.com/docs/csharp/project-management).**

# vscode-solution-explorer

This extension adds a Visual Studio Solution File explorer panel in Visual Studio Code. Now you can navigate into your solution following the original Visual Studio structure.

> *It was originally intended to work with .Net Core solutions and projects. For this reason, the compatibility with other types of projects (such as .Net Framework or C++) is not guaranteed.*

![Visual Studio Code Solution Explorer Showcase](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-show-case.gif)

If you want to enjoy the full experience, you should install:
- [.Net SDK](https://dotnet.microsoft.com/en-us/download) (dotnet command line is required)
- [Microsoft C# extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp) (aka Omnisharp)

Table of Content:
- [vscode-solution-explorer](#vscode-solution-explorer)
  - [Getting Started](#getting-started)
  - [Open Solutions](#open-solutions)
    - [Open Solution command](#open-solution-command)
    - [Omnisharp integration](#omnisharp-integration)
    - [Find Solution files](#find-solution-files)
  - [Features](#features)
    - [Run dotnet commands in solutions and projects](#run-dotnet-commands-in-solutions-and-projects)
    - [Drag and drop files, folders and projects](#drag-and-drop-files-folders-and-projects)
    - [Create, delete, rename or project folders and files](#create-delete-rename-or-project-folders-and-files)
    - [Create, delete, rename or move solution, solution folders and projects](#create-delete-rename-or-move-solution-solution-folders-and-projects)
    - [Add or remove nuget packages](#add-or-remove-nuget-packages)
    - [Update all nuget packages versions](#update-all-nuget-packages-versions)
    - [Inline nuget package version management (csproj)](#inline-nuget-package-version-management-csproj)
    - [Add or remove project references](#add-or-remove-project-references)
    - [Create file templates](#create-file-templates)
    - [Solution syntax highlighting](#solution-syntax-highlighting)
    - [Create Directory.Packages.props](#create-directorypackagesprops)
  - [Extension Settings](#extension-settings)
          - [Example](#example)
  - [Known Issues](#known-issues)
  - [License](#license)
  - [Thanks to contributors](#thanks-to-contributors)

If you like my work you can [🍺 buy me a beer](https://www.buymeacoffee.com/fernandoescolar) and show that love 😁

## Getting Started

To activate `vscode-solution-explorer` you have to **first open a folder or workspace**.

Then, you can find this extension displayed as:

- a tab in the "Explorer" activity

![Visual Studio Code Explorer tab](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-as-explorer-tab.gif)

- an activity with the Visual Studio icon

![Visual Studio Code Activity](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-as-activity.gif)

You can configure it in the Visual Studio Code settings panel, looking for "VsSolution: **Show Mode**" section:

![Visual Studio Code Settings: Show Modes](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-show-mode.png)

## Open Solutions

`vscode-solution-explorer` has several ways to open the solution files and you can configure them in the Visual Studio Code configuration panel.

### Open Solution command

You can execute the "Open solution" command from the command palette or from the welcome view (if no solution has been found).

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-open-command.png)

### Omnisharp integration

You can enable omnisharp integration and vscode-solution-explorer will open the same .sln or .slnx file you open with Microsoft`s extension.

![Activate Omnisharp integration in settings panel](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/omnisharp-integration.png)

> It will ignore .csproj files because vscode-solution-explorer cannot open a project file without a Solution.

> You have to install [Microsoft C# extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp) to enable omnisharp integration.

### Find Solution files

You can use the automatic solution file finder activating some options in the Visual Studio Code settings panel.

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/search-in-root-folder.png)

The `vssolution.openSolutions.inRootFolder` setting will look for the solution files in the root folder.

![inRootFolder](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/search-in-root-folder-recursive.png)

The `vssolution.openSolutions.inFoldersAndSubfolders` setting will search for the solution files in the root folder and its subfolders.

![inFoldersAndSubfolders](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/search-in-alt-folders.png)

And if you want to specify the subfolders where you want to look for the solution files you have to activate the `vssolution.openSolutions.inAltFolders` setting and specify the folders in the `vssolution.altSolutionFolders` setting:

![inAltFolders](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-alt-folders.png)


*You can combine all of these options to find the best configuration for you.*

## Features

Adds a Solution Explorer panel where you can find a Visual Studio Solution File Explorer:

### Run dotnet commands in solutions and projects

Only available when the project is of kind CPS (dotnet core).

- Build: `dotnet build`
- Clean: `dotnet clean`
- New: `dotnet new`
- Pack: `dotnet pack`
- Publish: `dotnet publish`
- Restore: `dotnet restore`
- Run: `dotnet run`
- Watch: `dotnet watch run`

![Run dotnet commands in solutions and projects](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-dotnet-commands.gif)

If you want to customize the terminal commands you can change them in the settings json file. These are the default commands configuration:

```json
{
  "vssolution.customCommands": {
    "addPackageReferenceToProject": [ "dotnet", "add", "\"$projectPath\"", "package", "\"$packageId\"" ],
    "addPackageReferenceToProjectWithVersion": [ "dotnet", "add", "\"$projectPath\"", "package", "\"$packageId\"", "-v", "\"$packageVersion\"" ],
    "addProjectReferenceToProject": [ "dotnet", "add", "\"$projectPath\"", "reference", "\"$referencedprojectPath\"" ],
    "build": [ "dotnet", "build", "\"$projectPath\"" ],
    "clean": [ "dotnet", "clean", "\"$projectPath\"" ],
    "createProject": [ "dotnet", "new", "\"$projectType\"", "-lang", "\"$language\"", "-n", "\"$projectName\"", "-o", "\"$folderName\"" ],
    "createSolution": [ "dotnet", "new", "sln", "-n", "\"$solutionName\"" ],
    "pack": [ "dotnet", "pack", "\"$projectPath\"" ],
    "publish": [ "dotnet", "publish", "\"$projectPath\"" ],
    "removeProjectFromSolution": [ "dotnet", "sln", "\"$solutionPath\"", "remove", "\"$projectPath\"" ],
    "removePackageReferenceFromProject": [ "dotnet", "remove", "\"$projectPath\"", "package", "\"$packageId\"" ],
    "removeProjectReferenceFromProject": [ "dotnet", "remove", "\"$projectPath\"", "reference", "\"$referencedprojectPath\"" ],
    "restore": [ "dotnet", "restore", "\"$projectPath\"" ],
    "run": [ "dotnet", "run", "--project", "\"$projectPath\"" ],
    "test": [ "dotnet", "test", "\"$projectPath\"" ],
    "watch": [ "dotnet", "watch", "run", "--project", "\"$projectPath\"" ]
  }
}
```

It will replace keywords like `$solutionPath` or `$projectPath` with the actual values.

As an example, if you want to compile in `Release` mode every time you publish a project you can create something like:

```json
{
  "vssolution.customCommands":  {
    "publish": [ "dotnet", "publish", "\"$projectPath\"", "-c", "Release" ]
  }
}
```

### Drag and drop files, folders and projects

![Drag and drop files, folders and projects](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-drag-and-drop.gif)


### Create, delete, rename or project folders and files

![Create, delete, rename or project folders and files](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-project-files.gif)

### Create, delete, rename or move solution, solution folders and projects

![Create, delete, rename or move solution, solution folders and projects](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-solution-files.gif)

### Add or remove nuget packages

Only available when the project is of kind CPS (dotnet core).

![Add or remove nuget packages](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-package-references.gif)

If you want to use custom nuget feeds it will look for a file called `nuget.config` in the root folder of the project and its parent folders. If it finds this file, it will read the configuration and use it. If it does not find it, it will use the default nuget feed.

As an Example:

```xml
<configuration>
  <packageSources>
    <add key="Nuget.org" value="https://api.nuget.org/v3/index.json" />
    <add key="PrivateFeed" value="https://mydomain.com/myfeed/index.json" />
  </packageSources>
  <packageSourceCredentials>
	  <PrivateFeed>
	    <add key="Username" value="me@email.com" />
      <add key="ClearTextPassword" value="my_super_strong_password" />
	  </PrivateFeed>
  </packageSourceCredentials>
</configuration>
```

If you are working with `/drive/path/to/project.csproj`, it will look for:
- `/drive/path/to/nuget.config`
- `/drive/path/nuget.config`
- `/drive/nuget.config`
- `/nuget.config`

> Note vscode-solution-explorer only supports ClearTextPassword credencials in nuget.config

### Update all nuget packages versions

Only available when the project is of kind CPS (dotnet core).

![Update all nuget packages versions](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-update-packages-versions.gif)

### Inline nuget package version management (csproj)

Only available when the project is of kind CPS (dotnet core) c# projects.

![Inline nuget package version management (csproj)](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-csproj-nuget-management.gif)

If you open a `.csproj` file you can see if the nuget packages versions are out-dated. You can update them by clicking on the `💡` icon and select the version you want to use. It also adds code completions for packages names and versions.

Or if you hover over a package version you can see a tooltip with all the available versions.

![Inline nuget package version management (csproj)](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-csproj-nuget-management.png)

**Notes**: This feature uses caching to avoid unnecessary calls to the nuget server. If you want to force the cache update you can use the `Solution Explorer: Invalidate Nuget Cache` command.

### Add or remove project references

Only available when the project is of kind CPS (dotnet core).

![Add or remove project references](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-project-references.gif)

### Create file templates

This extensions has a custom template system to create new files. When you create a new file you can select a template from the dropdown list:

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-new-file.gif)

You can customize the templates for your project. First of all click with the right mouse button on your solution file and select `Install File Creation Templates`. Then you have to move to `.vscode/solution-explorer` folder and you can find the file called `template-list.json`. This file contains the list of templates.

We strongly recommend you to update your templates after updating this extension:

![Install Or Update templates](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-install-templates.gif)

### Solution syntax highlighting

This extension adds syntax highlighting to `.sln` files.

![Solution syntax highlighting](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-sln-syntax.png)

And also for `.slnx` files.

![Solution XML syntax highlighting](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-slnx-syntax.png)

### Create Directory.Packages.props

You can add a `Directory.Packages.props` on Solution under `Solution items` folder. This option will remove all `Version` attribute of the `PacakageReferences` in the projects files. You can also add an existing `Directory.Packages.props` with `Add Solution file` on a folder.

![Add Directory.Packages.props](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-create-directory-packages.gif)

If a `Directory.Packages.props` are already present on the solution, after add a new project all `PackageReferences` will be updated and added the `PackageVersion` to the current file.

## Extension Settings

You can configure the extension in the Visual Studio Code settings panel:

- `vssolution.showMode` Show the solution explorer in the "activityBar", in the "explorer" pane or "none" to hide it. This feature is only for testing pourposes.

- `vssolution.solutionExplorerIcons` "solution-explorer": custom items from vscode-solution-explorer extension. "mix": file and folder icons from the installed icons theme. "current-theme": all the icons are from the installed icons theme.

- `vssolution.outputChannelMode` The solution explorer output channel mode: `show` on every single log, `append` but not show the pane or `none`.

- `vssolution.showTerminalOnCommand` Show the terminal when a command is executed.

- `vssolution.trackActiveItem` Select the active editor file in the solution explorer (not recommended).

- `vssolution.itemNesting` Sets whether related items will be displayed nested.

- `vssolution.netcoreIgnore` Folder and file names to ignore when get a dotnet core project content.

- `vssolution.xxprojItemTypes` Type of XML element to put in the xxproj files.

- `vssolution.xmlspaces` Spaces to be used for indenting XML output. It could be a number or an string. ex. "2", " " or "\t".

- `vssolution.altSolutionFolders` If there is no solution in the workplace root folder, it will search for solutions in any of these folders.

- `vssolution.win32Encoding` Win32 "codepage" to "iconv.js" encoding equivalences.

- `vssolution.openProjectOnClick`: Sets whether clicking a project in the explorer tree opens the underlying project file.

- `vssolution.customCommands` Sets custom the terminal commands.

- `vssolution.openSolutions.inRootFolder` Sets whether solutions will be automatically loaded from the root folder.

- `vssolution.openSolutions.inAltFolders` Sets whether solutions will be automatically loaded from the `vssolution.altSolutionFolders` parameter.

- `vssolution.openSolutions.inFoldersAndSubfolders` Sets whether solutions will be automatically loaded from the current opened folder and subfolders.

- `vssolution.openSolutions.selectedInOmnisharp` Sets whether to include prerelease packages when searching for NuGet packages.

- `vssolution.nuget.includePrerelease` Sets whether to include prerelease packages when searching for nuget packages.

- `vssolution.nuget.codeDecorators` Sets whether to show NuGet package versions in the code.

- `vssolution.nuget.codeActions` Sets whether to show NuGet package versions in the code actions.

- `vssolution.nuget.codeCompletions` Sets whether to show NuGet package versions and names in the code completions.

###### Example

```javascript
{
    "vssolution.showMode": "activityBar",

    "vssolution.solutionExplorerIcons": "current-theme",

    "vssolution.outputChannelMode": "show",

    "vssolution.showTerminalOnCommand": true,

    "vssolution.trackActiveItem": false,

    "vssolution.itemNesting": false,

    "vssolution.netcoreIgnore": [
        "bin",
        "node_modules",
        "obj",
        ".ds_store"
    ],

    "vssolution.xxprojItemTypes": {
        "*": "Content",
        "cs": "Compile",
        "cpp": "ClCompile",
        "cc": "ClCompile",
        "c": "ClCompile",
        "h": "ClInclude",
        "hpp": "ClInclude",
        "vb": "Compile",
        "fs": "Compile",
        "ts": "TypeScriptCompile"
    },

    "vssolution.xmlspaces": "2",

    "vssolution.altSolutionFolders": [
        "src"
    ],

    "vssolution.win32Encoding": {
        "932": "Shift_JIS",
        "936": "GBK",
        "950": "BIG5"
    },

    "vssolution.openSolutions.inRootFolder": false,
    "vssolution.openSolutions.inAltFolders": false,
    "vssolution.openSolutions.inFoldersAndSubfolders": false,
    "vssolution.openSolutions.selectedInOmnisharp": true,

    "vssolution.openProjectOnClick": false,

    "vssolution.nuget.includePrerelease": true
}
```

## Known Issues

Please report your issues: [vscode-solution-explorer GitHub page](https://github.com/fernandoescolar/vscode-solution-explorer/issues)

## License

The source code is licensed under the [MIT](LICENSE) license.

The icons from ([vscode-icons extension](https://github.com/vscode-icons/vscode-icons/)) are licensed under the [Creative Commons - ShareAlike (CC BY-SA)](https://creativecommons.org/licenses/by-sa/4.0/) license.

Branded icons are licensed under their copyright license.

## Thanks to contributors

[dfrencham](https://github.com/dfrencham)
[darkmfj](https://github.com/darkmfj)
[mwpenny](https://github.com/mwpenny)
[remcoros](https://github.com/remcoros)
[marawan31](https://github.com/marawan31)
[emrahcetiner](https://github.com/emrahcetiner)
[martinothamar](https://github.com/martinothamar)
[jesperbjensen](https://github.com/jesperbjensen)
[Dvvarf](https://github.com/Dvvarf)
[vthg2themax](https://github.com/vthg2themax)
[jloureiro09](https://github.com/jloureiro09)
[jbactad](https://github.com/jbactad)
[vlesierse](https://github.com/vlesierse)
[m4ss1m0g](https://github.com/m4ss1m0g)
[Coda](https://github.com/little512)
[Hongyang Du (hond)](https://github.com/Danieladu)
[Callum Marshall](https://github.com/callummarshall9)
[Philippe Desmarais](https://github.com/CephalonAhmes)
[LesanOuO](https://github.com/LesanOuO)
[ShalokShalom](https://github.com/ShalokShalom)
[nev-21](https://github.com/nev-21)
[Richard Willis](https://github.com/badsyntax)
[panoskj](https://github.com/panoskj)
[lhz](https://github.com/lhzcm)
[Spencer Farley](https://github.com/farlee2121)
[Fadi Hania](https://github.com/fadihania)

**Enjoy!**
