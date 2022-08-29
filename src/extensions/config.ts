import * as vscode from "vscode";
import { defaultTerminalCommands, TerminalCommand } from "./defaultTerminalCommands";

const CONFIGURATION_NAME = 'vssolution';
const ITEM_TYPE_NAME = 'xxprojItemTypes';
const SHOW_MODE_NAME = 'showMode';
const TRACK_ACTIVE_ITEM_NAME = 'trackActiveItem';
const SOLUTION_EXPLORER_ICONS_NAME = 'solutionExplorerIcons';
const SHOW_OUTPUT_CHANNEL_NAME = 'showOutputChannel';
const NETCORE_IGNORE_NAME = 'netcoreIgnore';
const ALTERNATIVE_SOLUTION_FOLDERS_NAME = 'altSolutionFolders';
const XML_SPACES_NAME = 'xmlspaces';
const XML_CLOSING_TAG_SPACE_NAME = 'xmlClosingTagSpace';
const WIN32_ENCODING_NAME = 'win32Encoding';
const LINE_ENDINGS_NAME = 'lineEndings';
const ITEM_NESTING_NAME = 'itemNesting';
const OPEN_SOLUTIONS_IN_ROOT_FOLDER_NAME = 'openSolutions.inRootFolder';
const OPEN_SOLUTIONS_IN_ALTERNATIVE_FOLDERS_NAME = 'openSolutions.inAltFolders';
const OPEN_SOLUTIONS_IN_FOLDER_AND_SUBFOLDERS_NAME = 'openSolutions.inFoldersAndSubfolders';
const OPEN_SOLUTION_SELECTED_IN_OMNISHARP_NAME = 'openSolutions.selectedInOmnisharp';
const CUSTOM_COMMANDS_NAME = 'customCommands';

let config: vscode.WorkspaceConfiguration;

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

export function getShowMode(): string {
    return config.get<string>(SHOW_MODE_NAME, SHOW_MODE_ACTIVITYBAR);
}

export function getSolutionExplorerIcons(): string {
    return config.get<string>(SOLUTION_EXPLORER_ICONS_NAME, ICONS_CUSTOM);
}

export function getTrackActiveItem(): boolean {
    return config.get<boolean>(TRACK_ACTIVE_ITEM_NAME, false);
}

export function getShowOutputChannel(): boolean {
    return config.get<boolean>(SHOW_OUTPUT_CHANNEL_NAME, true);
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

    return result;
}

export type LineEndingsType = "lf" | "crlf";

export const ICONS_THEME = "current-theme";
export const ICONS_MIXED = "mix";
export const ICONS_CUSTOM = "solution-explorer";

export const SHOW_MODE_ACTIVITYBAR = "activityBar";
export const SHOW_MODE_EXPLORER = "explorer";
export const SHOW_MODE_NONE = "none";
