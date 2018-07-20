# vscode-solution-explorer

This extension adds a Visual Studio Solution File explorer panel in Visual Studio Code. Now you can navigate into your solution following the original Visual Studio structure.

## Features

Adds a Solution Explorer panel where you can find a Visual Studio Solution File Explorer.

- Can load any .sln version

- Supports csproj, fsproj and vbproj (from vs2017 and before)

- Supports dotnet core projects

- You can create, delete, rename or move project folders and files.

- You can create, delete, rename or move solution, solution folders and projects.

- You can add or remove packages and references when the project is of kind CPS (dotnet core).

![Solution Explorer](https://github.com/fernandoescolar/vscode-solution-explorer/raw/master/images/vscode-solution-explorer-1.gif)

![Solution Explorer](https://github.com/fernandoescolar/vscode-solution-explorer/raw/master/images/vscode-solution-explorer-2.gif)

![Solution Explorer](https://github.com/fernandoescolar/vscode-solution-explorer/raw/master/images/vscode-solution-explorer-3.gif)

## Requirements

You have to open a folder with at least one solution file (".sln") in the root path.

Or you can create a new one by clicking with the rigth mouse button.

## License

The source code is licensed under the [MIT](License) license.

The icons from ([vscode-icons extension](https://github.com/vscode-icons/vscode-icons/)) are licensed under the [Creative Commons - ShareAlike (CC BY-SA)](https://creativecommons.org/licenses/by-sa/4.0/) license. 

Branded icons are licensed under their copyright license.

## Extension Settings

- `vssolution.showMode` Show the solution explorer in the "activityBar", in the "explorer" pane or "none" to hide it. This feature is only for testing pourposes.

- `vssolution.solutionExplorerIcons` "solution-explorer": custom items from vscode-solution-explorer extension. "mix": file and folder icons from the installed icons theme. "current-theme": all the icons are from the installed icons theme.

- `vssolution.showOutputChannel` Show the solution explorer output channel.

- `vssolution.trackActiveItem` Select the active editor file in the solution explorer.

- `vssolution.netcoreIgnore` Folder and file names to ignore when get a dotnet core project content.

- `vssolution.xxprojItemTypes` Type of XML element to put in the xxproj files.

- `vssolution.xmlspaces` Spaces to be used for indenting XML output. It could be a number or an string. ex. "2", " " or "t".

- `vssolution.altSolutionFolders` If there is no solution in the workplace root folder, it will search for solutions in any of these folders.

###### Example

```javascript
{
    "vssolution.showMode": "explorer",

    "vssolution.solutionExplorerIcons": "current-theme", 

    "vssolution.showOutputChannel": true,

    "vssolution.trackActiveItem": true,

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
    },

    "vssolution.xmlspaces": "2",

    "vssolution.altSolutionFolders": [
        "src"
    ]
}
```

## Known Issues

Please report your issues: [vscode-solution-explorer GitHub page](https://github.com/fernandoescolar/vscode-solution-explorer/issues)

## Release Notes

There is a lot of work to do.

### 0.2.31

Bug Fixed #24: Now the solution context menu doesn't show the dotnet core commands if the solution doesn't have any CPS (dotnet core) project.

New feature #26: Adds a new option: xmlClosingTagSpace. When xmlClosingTagSpace is enabled, closing tags are written as: " />" rather than "/>" - this is for Visual Studio compatibility. (PR #27 by [dfrencham](https://github.com/dfrencham))

### 0.2.30

New feature #26: Added a new parameter to set the xml spaces.

Bug fixed #25: Check if the project XML format is not as expected.

### 0.2.29

New feature #18: .deployproj files support added.

## Thanks to contributors

[dfrencham] (https://github.com/dfrencham)

**Enjoy!**
