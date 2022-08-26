# vscode-solution-explorer

This extension adds a Visual Studio Solution File explorer panel in Visual Studio Code. Now you can navigate into your solution following the original Visual Studio structure.

> *It was originally intended to work with .Net Core solutions and projects. And that is why support for other types of projects (such as .Net Framework or C++) is not guaranteed.*

![Visual Studio Code Solution Explorer Showcase](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-show-case.gif)

If you want to enjoy the full experience, you should install:
- [.Net Core SDK](https://dotnet.microsoft.com/en-us/download) (dotnet command line is required)
- [Microsoft C# extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp) (aka Omnisharp)

Table of Content:
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
    - [Add or remove project references](#add-or-remove-project-references)
  - [Extension Settings](#extension-settings)
  - [Known Issues](#known-issues)
  - [Release Notes](#release-notes)
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

You can enable omnisharp integration and vscode-solution-explorer will open the same .sln file you open with Microsoft extension.

![Activate Omnisharp integration in settings panel](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/omnisharp-integration.png)

> It will ignore .csproj files because vscode-solution-explorer cannot open a project file without a Solution.

> You have to install [Microsoft C# extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp) to enable omnisharp integration.

### Find Solution files

You can use the automatic solution file finder activating some options in the Visual Studio Code settings panel.

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/search-in-root-folder.png)

The `vssolution.openSolutions.inRootFolder` setting will look for the solution files in the root folder.

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/search-in-root-folder-recursive.png)

The `vssolution.openSolutions.inFoldersAndSubfolders` setting will search for the solution files in the root folder and its subfolders.

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/search-in-alt-folders.png)

And if you want to specify the subfolders where you want to look for the solution files you have to activate the `vssolution.openSolutions.inAltFolders` setting and specify the folders in the `vssolution.altSolutionFolders` setting:

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-alt-folders.png)


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

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-dotnet-commands.gif)

### Drag and drop files, folders and projects

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-drag-and-drop.gif)


### Create, delete, rename or project folders and files

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-project-files.gif)

### Create, delete, rename or move solution, solution folders and projects

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-solution-files.gif)

### Add or remove nuget packages

Only available when the project is of kind CPS (dotnet core).

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-package-references.gif)

### Update all nuget packages versions

Only available when the project is of kind CPS (dotnet core).

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-update-packages-versions.gif)

### Add or remove project references

Only available when the project is of kind CPS (dotnet core).

![Open Solution Command](https://github.com/fernandoescolar/vscode-solution-explorer/raw/main/images/vscode-solution-explorer-project-references.gif)

## Extension Settings

You can configure the extension in the Visual Studio Code settings panel:

- `vssolution.showMode` Show the solution explorer in the "activityBar", in the "explorer" pane or "none" to hide it. This feature is only for testing pourposes.

- `vssolution.solutionExplorerIcons` "solution-explorer": custom items from vscode-solution-explorer extension. "mix": file and folder icons from the installed icons theme. "current-theme": all the icons are from the installed icons theme.

- `vssolution.showOutputChannel` Show the solution explorer output channel.

- `vssolution.trackActiveItem` Select the active editor file in the solution explorer (not recomended).

- `vssolution.itemNesting` Sets whether related items will be displayed nested.

- `vssolution.netcoreIgnore` Folder and file names to ignore when get a dotnet core project content.

- `vssolution.xxprojItemTypes` Type of XML element to put in the xxproj files.

- `vssolution.xmlspaces` Spaces to be used for indenting XML output. It could be a number or an string. ex. "2", " " or "t".

- `vssolution.altSolutionFolders` If there is no solution in the workplace root folder, it will search for solutions in any of these folders.

- `vssolution.win32Encoding` Win32 "codepage" to "iconv.js" encoding equivalences.

- `vssolution.openSolutions.inRootFolder` Sets whether solutions will be automatically loaded from the root folder.

- `vssolution.openSolutions.inAltFolders` Sets whether solutions will be automatically loaded from the `vssolution.altSolutionFolders` parameter.

- `vssolution.openSolutions.inFoldersAndSubfolders` Sets whether solutions will be automatically loaded from the current opened folder and subfolders.

- `vssolution.openSolutions.selectedInOmnisharp` Sets whether solutions will be automatically loaded from the current selected solution in Omnisharp extension.

###### Example

```javascript
{
    "vssolution.showMode": "activityBar",

    "vssolution.solutionExplorerIcons": "current-theme",

    "vssolution.showOutputChannel": true,

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
    "vssolution.openSolutions.selectedInOmnisharp": true
}
```

## Known Issues

Please report your issues: [vscode-solution-explorer GitHub page](https://github.com/fernandoescolar/vscode-solution-explorer/issues)

## Release Notes

There is a lot of work to do.

### 0.6.0

Improving add nuget package command: now it searches in the nuget repository for the package and let you select the version

Improving move and copy commands: now it prevents replacing existing files

Improving the output channel behavior

Enhancement #9: Adding drag and drop functionality: move  projects, folders and files arround the solution, and copy files and folders between projects

Updating README

Updating to latests node and vscode dependencies versions

Updating  to typescript v4.7.4

New internal activity system to run features

Using vscode fs API

Using vscode clipboard API

### 0.5.0

Adding open solution command

Adding different automatic open solution flags: in root folder, in alt folders, in root folders and subfolders (Enhancement #204), and omnisharp integration

Adding command to update package references versions automatically

Bugfix #205: README images fixed thanks to [Philippe Desmarais](https://github.com/CephalonAhmes)

Adding welcome view when no solution found

Updating README

### 0.4.7

Enhancement #63: prefix commands with "SolutionExplorer: "

Enhancement #167: using runtime icons for tree actions

Enhancement #189: it tries to determine the file extension when you create a new one without extension

Enhancement #159: added new command: "SolutionExplorer: Select Active Document"

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

**Enjoy!**
