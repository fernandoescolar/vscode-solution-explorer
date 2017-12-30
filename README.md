# vscode-solution-explorer 

This extension adds a Visual Studio Solution File explorer panel in Visual Studio Code. Now you can navigate into your solution following the original Visual Studio structure. 

## Features

Adds a Solution Explorer panel where you can find a Visual Studio Solution File Explorer. 

![Solution Explorer](https://github.com/fernandoescolar/vscode-solution-explorer/raw/master/images/vscode-solution-explorer.png)

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

There are not settings for now... 

## Known Issues

...

## Release Notes

There is a lot of work to do.

### 0.0.4

BugFixed: when it found an unkonwn project type it doesn't crash.

Refactor: using async and await for solution and project operations.

Added WebSite project type support.

Added projects before vs2017 (csproj, vbproj and fsproj) support.

### 0.0.3

Refactoring: all source code has changed.

New "references" icon in solution explorer.

Added context menu commands to create, delete and modify project files and folders.

### 0.0.2

Updated project information, repository and logo.

### 0.0.1

Initial release.

Only Visual Studio Common Project System (VS2017 -> dotnet core) support.

**Enjoy!**
