# vscode-solution-explorer

This extension adds a Visual Studio Solution File explorer panel in Visual Studio Code. Now you can navigate into your solution following the original Visual Studio structure.

## Features

Adds a Solution Explorer panel where you can find a Visual Studio Solution File Explorer. 

![Solution Explorer](https://github.com/fernandoescolar/vscode-solution-explorer/raw/master/images/vscode-solution-explorer.gif)

- Can load any .sln version

- Supports csproj, fsproj and vbproj (from vs2017 and before)

- Supports dotnet core projects

- You can create, delete, rename or move project folders and files.

- You can create, delete, rename or move solution, solution folders and projects.

- You can add or remove packages and references when the project is of kind CPS (dotnet core).

## Requirements

You have to open a folder with at least one solution file (".sln") in the root path.

Or you can create a new one by clicking with the rigth mouse button.

## License

The source code is licensed under the [MIT](License) license.

The icons from ([vscode-icons extension](https://github.com/vscode-icons/vscode-icons/)) are licensed under the [Creative Commons - ShareAlike (CC BY-SA)](https://creativecommons.org/licenses/by-sa/4.0/) license. 

Branded icons are licensed under their copyright license.

## Extension Settings

- `vssolution.showInExplorer` Show the solution explorer in the explorer pane.

- `vssolution.showOutputChannel` Show the solution explorer output channel.

- `vssolution.useSolutionExplorerIcons` If 'true' it uses the vscode-solution-explorer custom icons. If 'false' it uses the installed icon theme.

- `vssolution.netcoreIgnore` Folder and file names to ignore when get a dotnet core project content.

- `vssolution.xxprojItemTypes` Type of XML element to put in the xxproj files.

###### Example

```javascript
{
    "vssolution.showInExplorer": true,

    "vssolution.showOutputChannel": true,

    "vssolution.useSolutionExplorerIcons": true, 

    "vssolution.netcoreIgnore": [
        "bin",
        "node_modules",
        "obj",
        ".ds_store"
    ],

    "vssolution.xxprojItemTypes": {
        "*": "Content",
        "cs": "Compile",
        "vb": "Compile",
        "fs": "Compile",
        "ts": "TypeScriptCompile"
    }
}
```

## Known Issues

Please report your issues: [vscode-solution-explorer GitHub page](https://github.com/fernandoescolar/vscode-solution-explorer/issues)

## Release Notes

There is a lot of work to do.

### 0.2.4

Added add existing project to solution command.

On double click in a file, it is opened and pinned.

(WIP) collapse all button doesn't work due to a issue with the vscode refreshing.

Use installed theme icons: set 'vssolution.useSolutionExplorerIcons' configuration parameter to false.

### 0.2.3

CPS projects take care of ignore configuration parameter on "move to folder" command options.

### 0.2.2

Sort solution and solution folder child items.

### 0.2.1

Refactor commands using command pattern.

Added File Watcher to detect project and solution changes.

Added Output Channel to log commands.

Added move folder and file to folder in project.

Added add and remove packages commands in CPS projects.

Added add and remove project reference commands in CPS projects.

Added create project and solution commands.

Added create and remove solution folder commands.

Added move solution folder and project to solution folder commands.

Added rename solution, solution folder and project commands.

**Enjoy!**
