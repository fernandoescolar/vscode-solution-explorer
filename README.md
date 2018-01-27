# vscode-solution-explorer 

This extension adds a Visual Studio Solution File explorer panel in Visual Studio Code. Now you can navigate into your solution following the original Visual Studio structure. 

## Features

Adds a Solution Explorer panel where you can find a Visual Studio Solution File Explorer. 

![Solution Explorer](https://github.com/fernandoescolar/vscode-solution-explorer/raw/master/images/vscode-solution-explorer.gif)

- Can load any .sln version

- Supports csproj, fsproj and vbproj (from vs2017 and before)

- Supports dotnet core projects

- You can create, delete or rename project folders and files. 

## Requirements

You have to open a folder with at least solution file (".sln") in the root path.

## License

The source code is licensed under the [MIT](License) license.

The icons from ([vscode-icons extension](https://github.com/vscode-icons/vscode-icons/)) are licensed under the [Creative Commons - ShareAlike (CC BY-SA)](https://creativecommons.org/licenses/by-sa/4.0/) license. 

Branded icons are licensed under their copyright license.

## Extension Settings

- `vssolution.showInExplorer` Show the solution explorer in the explorer pane.

- `vssolution.showOutputChannel` Show the solution explorer output channel.

- `vssolution.netcoreIgnore` Folder and file names to ignore when get a dotnet core project content

- `vssolution.xxprojItemTypes` Type of XML element to put in the xxproj files.

###### Example

```javascript
{
    "vssolution.showInExplorer": true,

    "vssolution.showOutputChannel" : true,

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

### 0.0.10

Refactor commands using command pattern.

Added File Watcher to detect project and solution changes.

Added Output Channel to log commands.

Added move folder and files to folder in project.

Added add and remove packages commands in CPS projects.

Added add and remove project reference commands in CPS projects.

### 0.0.9

Added configuration settings.

### 0.0.8

Fixing a bug getting the content of a dotnet project sub-folder.

### 0.0.7

Fixing lost dependencies.

**Enjoy!**
