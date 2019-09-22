# Change Log

All notable changes to the "vscode-solution-explorer" extension will be documented in this file.

## 0.3.5

Bugfix #80: thanks to [martinothamar](https://github.com/martinothamar) for his PR

PR #88: thanks to [jesperbjensen](https://github.com/jesperbjensen)

## 0.3.4

Bugfix #83: fixed dynamic scripts loading due to webpack use.

PR #75: fix: convert dash to underscore in namespace - by [emrahcetiner](https://github.com/emrahcetiner)

## 0.3.3

Bugfix #79: fixed dynamic scripts loading due to webpack use.

Bugfix #25 #80: check if the project loaded XML has no elements in CPS projects.

## 0.3.2

PR #72: Added new fsproj cps support - by [marawan31](https://github.com/marawan31)

Bugfix #67 #68 #73 #77: added webpack compilation in order to reduce the modules load time.

## 0.3.1

Bug fixed: Create new file, project and solution command issues.

New Feature #61: Now solution file items are shown.

## 0.3.0

Bug fixed #51: Updated license to CC-BY-SA.

Bug fixed #49: Modify default 'showMode' and 'trackActiveItem' configuration setting values.

New comand parameter compiler adding a wizard style requesting commad parameters.

Bug fixed #48: now you can specify the package version when adding a new nuget package to a project.

Bug fixed #55: changed message to create a new solution.

Bug fixed #53: deleted test button from solution level.

Bug fixed #42: added the solution/project path in dotnet commads.

Bug fixed #54: launch dotnet commands in terminal.

PR #46: Add an option to disable the question about creating the solution template folder - by [remcoros](https://github.com/remcoros).

PR #56: Properly handle project files with paths outside the project root - by [mwpenny](https://github.com/mwpenny)

PR #58: Add support for C/C++ projects (.vcxproj; issue #19) - by [mwpenny](https://github.com/mwpenny)

## 0.2.34

Added "win32Encoding" configuration parameter to help people fixing win32 encoding problems in the output.

Bug fixed #36: chinese encoding problem. Thanks to [darkmfj](https://github.com/darkmfj).

Feature #23: Added .njsproj project support.

## 0.2.33

Bug fixed #32: If you select "explorer" mode it doesn't show the "activityBar" icon.

Bug fixed #35: commented "Project" tag lines in the ".xxproj" files are ignored.

## 0.2.32

Activated again the activity bar show mode. It's not working right. But some people have ask for it.

## 0.2.31

Bug Fixed #24: Now the solution context menu doesn't show the dotnet core commands if the solution doesn't have any CPS (dotnet core) project.

New feature #26: Adds a new option: xmlClosingTagSpace. When xmlClosingTagSpace is enabled, closing tags are written as: " />" rather than "/>" - this is for Visual Studio compatibility. (PR #27 by [dfrencham](https://github.com/dfrencham))

## 0.2.30

New feature #26: Added a new parameter to set the xml spaces.

Bug fixed #25: Check if the project XML format is not as expected.

## 0.2.29

New feature #18: .deployproj files support added.

## 0.2.28

Bug fixed #21: allow invoke create new empty solution from command palette.

Bug fixed #20: now the "vssolution.trackActiveItem" configuration setting works right.

## 0.2.27

Litle bugfixed when trying to load solutions in other folder and those folders don't exist.

Ignore empty string in logs.

## 0.2.26

Bug fixed #16: using this workarround to try to solve the encoding bug in the output channel: https://github.com/Microsoft/vscode-arduino/commit/00d3fefcead1a95ec1b1ffbb32abc0f1b0a47a82

## 0.2.25

Bug fixed #15: the npm package "xml2js" has been replaced by "xml-js". The idea behind this modification is to keep the structure of the document as similar to the original.

Added `vssolution.altSolutionFolders` configuration parameter to allow specify other folder than the root with .sln files. It is related with the issue #8.

## 0.2.24

Delete activity bar item, it is not usable for now.

Added track active item.

## 0.2.23

Bug fixed: remove package and remove project reference command.

Bug fixed: do not show the current project in the add referenced project suggesion.

Now the solution explorer is showed in its custom panel in the activity bar.

Updated to vscode 1.23.

## 0.2.11

Added dotnet commands: build, clean, pack, publish, restore, run and test.

## 0.2.10

Bug fixed: error removing a folder with files in old xxproj files.

Added basic support for .shproj files.

Improved xml node name selection on edit old xxproj.

Updated question popups to show 'No' option.

Updated to vscode 1.21.1.

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