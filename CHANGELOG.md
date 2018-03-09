# Change Log

All notable changes to the "vscode-solution-explorer" extension will be documented in this file.

## 0.2.9

Bug fixed: #6 Wrong warning about incorrect type for xxprojItemTypes.

Updated icons from current theme with the vscode 1.21.0 new features.

Added commands shorcuts (but you have to open the context menu to make it work :( ).

## 0.2.8

Ask for install templates only when at least one solution is found.

Added more inline actions for create files and folders.

Refactoring template engine installation.

Rename command now has the old name value to modify.

Add project command is showed in the right group, and it has a default project destination folder based on name.

## 0.2.7

Removed "Collapse All" button. It doesn't work and causes issues.

## 0.2.6

Copy and Paste command in files, folders and projects.

Commands now are grouped.

Added refresh command as inline icon in folders and projects.

Fixed delete folder command in order to delete all tree.

Changed the icons mode to "solution-explorer", "mix" or "current-theme" in the configuration settings.

Added template system to create new files.

## 0.2.5

Bugfix: Add reference and add package commands now works

Bugfix: It doesn't show the "Cannot read property 'FullPath' of null" on startup (#4)

## 0.2.4

Added add existing project to solution command.

On double click in a file, it is opened and pinned.

(WIP) collapse all button doesn't work due to a issue with the vscode refreshing.

Use installed theme icons: set 'vssolution.useSolutionExplorerIcons' configuration parameter to false.

## 0.2.3

CPS projects take care of ignore configuration parameter on "move to folder" command options.

## 0.2.2

Sort solution and solution folder child items.

## 0.2.1

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

## 0.0.9

Refactoring.

Added configuration settings.

## 0.0.8

Fixing a bug getting the content of a dotnet project sub-folder.

## 0.0.7

Fixing lost dependencies.

## 0.0.6

Cleaning extension binaries.

## 0.0.5

Fixing paths in order it runs in windows (sorry, i'd not tested :( )

## 0.0.4

BugFixed: when it found an unkonwn project type it doesn't crash.

Refactor: using async and await for solution and project operations.

Added WebSite project type support.

Added projects before vs2017 (csproj, vbproj and fsproj) support.

## 0.0.3

Refactoring: all source code has changed.

New "references" icon in solution explorer.

Added context menu commands to create, delete and modify project files and folders.

## 0.0.2

Updated project information, repository and logo.

## 0.0.1

Initial release.

Only Visual Studio Common Project System (VS2017 -> dotnet core) support.

I hope it works :)