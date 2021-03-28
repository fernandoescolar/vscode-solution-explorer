# vscode-solution-explorer

This extension adds a Visual Studio Solution File explorer panel in Visual Studio Code. Now you can navigate into your solution following the original Visual Studio structure.

## Features

Adds a Solution Explorer panel where you can find a Visual Studio Solution File Explorer.

- Can load any .sln version

- Supports csproj, vcxproj, fsproj and vbproj (from vs2017 and before)

- Supports dotnet core projects

- You can create, delete, rename or move project folders and files.

- You can create, delete, rename or move solution, solution folders and projects.

- You can add or remove packages and references when the project is of kind CPS (dotnet core).

![Solution Explorer](https://github.com/fernandoescolar/vscode-solution-explorer/raw/master/images/vscode-solution-explorer-1.gif)

![Solution Explorer](https://github.com/fernandoescolar/vscode-solution-explorer/raw/master/images/vscode-solution-explorer-2.gif)

![Solution Explorer](https://github.com/fernandoescolar/vscode-solution-explorer/raw/master/images/vscode-solution-explorer-3.gif)

## Requirements

You have to open a folder with at least one solution file (".sln") in the root path.

Or you can create a new one by clicking with the right mouse button.

## License

The source code is licensed under the [CC-BY-SA](LICENSE.md) license.

The icons from ([vscode-icons extension](https://github.com/vscode-icons/vscode-icons/)) are licensed under the [Creative Commons - ShareAlike (CC BY-SA)](https://creativecommons.org/licenses/by-sa/4.0/) license.

Branded icons are licensed under their copyright license.

## Extension Settings

- `vssolution.showMode` Show the solution explorer in the "activityBar", in the "explorer" pane or "none" to hide it. This feature is only for testing pourposes.

- `vssolution.solutionExplorerIcons` "solution-explorer": custom items from vscode-solution-explorer extension. "mix": file and folder icons from the installed icons theme. "current-theme": all the icons are from the installed icons theme.

- `vssolution.showOutputChannel` Show the solution explorer output channel.

- `vssolution.trackActiveItem` Select the active editor file in the solution explorer (not recomended).

- `vssolution.netcoreIgnore` Folder and file names to ignore when get a dotnet core project content.

- `vssolution.xxprojItemTypes` Type of XML element to put in the xxproj files.

- `vssolution.xmlspaces` Spaces to be used for indenting XML output. It could be a number or an string. ex. "2", " " or "t".

- `vssolution.altSolutionFolders` If there is no solution in the workplace root folder, it will search for solutions in any of these folders.

- `vssolution.win32Encoding` Win32 "codepage" to "iconv.js" encoding equivalences.

###### Example

```javascript
{
    "vssolution.showMode": "activityBar",

    "vssolution.solutionExplorerIcons": "current-theme",

    "vssolution.showOutputChannel": true,

    "vssolution.trackActiveItem": false,

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
    }
}
```

## Known Issues

Please report your issues: [vscode-solution-explorer GitHub page](https://github.com/fernandoescolar/vscode-solution-explorer/issues)

## Release Notes

There is a lot of work to do.

## 0.4.2

Bugfix #164: revert #118 solution

### 0.4.1

Bugfix #155: fixing error deleting folders

Bugfix #118: save XML special characters encoded: `& < > " '`

Bugfix #84: avoid errors with non-existing projects in solution

### 0.4.0

Enhancement #38 #50 #158: Add multi folder in workspace support. Thanks to [vlesierse](https://github.com/vlesierse) and [m4ss1m0g](https://github.com/m4ss1m0g) for their PRs.

Upgrading npm packages

### 0.3.11

Upgrading npm packages

Enhancement #139: Add more project templates. Thanks to [jbactad](https://github.com/jbactad)

Bugfix #135: Don't focus tree when tracking active file. Thanks to [jbactad](https://github.com/jbactad)

### 0.3.10

Upgrading npm packages

Bugfix #130: space in file path

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

**Enjoy!**
