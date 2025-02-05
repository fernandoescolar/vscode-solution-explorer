import * as vscode from "vscode";
import { defaultTerminalCommands, TerminalCommand } from "./defaultTerminalCommands";

const CONFIGURATION_NAME = 'vssolution';
const ITEM_TYPE_NAME = 'xxprojItemTypes';
const SHOW_MODE_NAME = 'showMode';
const TRACK_ACTIVE_ITEM_NAME = 'trackActiveItem';
const SOLUTION_EXPLORER_ICONS_NAME = 'solutionExplorerIcons';
const OUTPUT_CHANNEL_MODE_NAME = 'outputChannelMode';
const SHOW_TERMINAL_ON_COMMAND_NAME = 'showTerminalOnCommand';
const NETCORE_IGNORE_NAME = 'netcoreIgnore';
const ALTERNATIVE_SOLUTION_FOLDERS_NAME = 'altSolutionFolders';
const XML_SPACES_NAME = 'xmlspaces';
const XML_CLOSING_TAG_SPACE_NAME = 'xmlClosingTagSpace';
const WIN32_ENCODING_NAME = 'win32Encoding';
const LINE_ENDINGS_NAME = 'lineEndings';
const ITEM_NESTING_NAME = 'itemNesting';
const OPEN_PROJECT_ON_CLICK = 'openProjectOnClick';
const OPEN_PROJECT_INLINE_BUTTON_SHOWN = 'openProjectInlineButtonShown';
const OPEN_SOLUTIONS_IN_ROOT_FOLDER_NAME = 'openSolutions.inRootFolder';
const OPEN_SOLUTIONS_IN_ALTERNATIVE_FOLDERS_NAME = 'openSolutions.inAltFolders';
const OPEN_SOLUTIONS_IN_FOLDER_AND_SUBFOLDERS_NAME = 'openSolutions.inFoldersAndSubfolders';
const OPEN_SOLUTION_SELECTED_IN_OMNISHARP_NAME = 'openSolutions.selectedInOmnisharp';
const CUSTOM_COMMANDS_NAME = 'customCommands';
const NUGET_INCLUDE_PRERELEASE_NAME = 'nuget.includePrerelease';
const NUGET_CODE_DECORATORS_NAME = 'nuget.codeDecorators';
const NUGET_CODE_ACTIONS_NAME = 'nuget.codeActions';
const NUGET_CODE_COMPLETIONS_NAME = 'nuget.codeCompletions';

let config: vscode.WorkspaceConfiguration;

export type LineEndingsType = "lf" | "crlf";
export type ShowMode = "activityBar" | "explorer" | "none";
export type IconsMode = "current-theme" | "mix" | "solution-explorer";
export type OutputChannelMode = "show" | "append" | "none";

export function register() {
    config = vscode.workspace.getConfiguration(CONFIGURATION_NAME);
}

export function getItemTypes(): { [id: string]: string } {
    return config.get<{ [id: string]: string }>(ITEM_TYPE_NAME, {
        ["*"   ]: "Content",
        ["cs"  ]: "Compile",
        ["cpp" ]: "ClCompile",
        ["cc"  ]: "ClCompile",
        ["c"   ]: "ClCompile",
        ["h"   ]: "ClInclude",
        ["hpp" ]: "ClInclude",
        ["vb"  ]: "Compile",
        ["fs"  ]: "Compile",
        ["ts"  ]: "TypeScriptCompile",
        ["xaml"]: "EmbeddedResource"
    });
}

export function getShowMode(): ShowMode {
    return config.get<ShowMode>(SHOW_MODE_NAME, "activityBar");
}

export function getSolutionExplorerIcons(): IconsMode {
    return config.get<IconsMode>(SOLUTION_EXPLORER_ICONS_NAME, "solution-explorer");
}

export function getTrackActiveItem(): boolean {
    return config.get<boolean>(TRACK_ACTIVE_ITEM_NAME, false);
}

export function getOutputChannelMode(): OutputChannelMode {
    return config.get<OutputChannelMode>(OUTPUT_CHANNEL_MODE_NAME, "append");
}

export function getShowTerminalOnCommand(): boolean {
    return config.get<boolean>(SHOW_TERMINAL_ON_COMMAND_NAME, true);
}

export function getNetCoreIgnore(): string[] {
    return config.get<string[]>(NETCORE_IGNORE_NAME, [ "bin", "node_modules", "obj", ".ds_store" ]);
}

export function getAlternativeSolutionFolders(): string[] {
    return config.get<string[]>(ALTERNATIVE_SOLUTION_FOLDERS_NAME, [ "src" ]);
}

export function getXmlSpaces(): string | number {
    let value = config.get<string>(XML_SPACES_NAME, "2");
    if (isNaN(parseInt(value))) {
        return value;
    } else {
        return parseInt(value);
    }
}

export function getXmlClosingTagSpace(): boolean {
    return config.get<boolean>(XML_CLOSING_TAG_SPACE_NAME, false);
}

export function getWin32EncodingTable(): { [id: string]: string } {
    return config.get<{ [id: string]: string }>(WIN32_ENCODING_NAME, {
        ["932"]: "Shift_JIS",
        ["936"]: "GBK",
        ["950"]: "BIG5"
    });
}

export function getLineEndings() : LineEndingsType {
    return config.get<LineEndingsType>(LINE_ENDINGS_NAME, "lf");
}

export function getItemNesting(): boolean {
    return config.get<boolean>(ITEM_NESTING_NAME, false);
}

export function getOpenProjectOnClick(): boolean {
    return config.get<boolean>(OPEN_PROJECT_ON_CLICK, false);
}

export function getOpenProjectInlineButtonShown(): boolean {
    return config.get<boolean>(OPEN_PROJECT_INLINE_BUTTON_SHOWN, true);
}

export function getOpenSolutionsInRootFolder(): boolean {
    return config.get<boolean>(OPEN_SOLUTIONS_IN_ROOT_FOLDER_NAME, true);
}

export function getOpenSolutionsInAltFolders(): boolean {
    return config.get<boolean>(OPEN_SOLUTIONS_IN_ALTERNATIVE_FOLDERS_NAME, true);
}

export function getOpenSolutionsInFoldersAndSubfolders(): boolean {
    return config.get<boolean>(OPEN_SOLUTIONS_IN_FOLDER_AND_SUBFOLDERS_NAME, false);
}

export function getOpenSolutionsSelectedInOmnisharp(): boolean {
    return config.get<boolean>(OPEN_SOLUTION_SELECTED_IN_OMNISHARP_NAME, false);
}

export function getCustomCommands(key: TerminalCommand): string[] {
    const commands = config.get<{ [id: string]: string[] }>(CUSTOM_COMMANDS_NAME, {});
    let result = commands[key];
    if (!result || !Array.isArray(result) || result.length === 0) {
        result = defaultTerminalCommands[key];
    }

    return result.slice();
}

export function getNugetIncludePrerelease(): boolean {
    return config.get<boolean>(NUGET_INCLUDE_PRERELEASE_NAME, false);
}

export function getNugetCodeDecorators(): boolean {
    return config.get<boolean>(NUGET_CODE_DECORATORS_NAME, true);
}

export function getNugetCodeActions(): boolean {
    return config.get<boolean>(NUGET_CODE_ACTIONS_NAME, true);
}

export function getNugetCodeCompletions(): boolean {
    return config.get<boolean>(NUGET_CODE_COMPLETIONS_NAME, true);
}