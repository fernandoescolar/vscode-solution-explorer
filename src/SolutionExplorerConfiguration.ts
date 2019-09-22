import * as vscode from "vscode";

const ConfigurationName = 'vssolution';
const ItemTypesName = 'xxprojItemTypes';
const ShowModeName = 'showMode';
const TrackActiveItemName = 'trackActiveItem';
const SolutionExplorerIconsName = 'solutionExplorerIcons';
const ShowOutputChannelName = 'showOutputChannel';
const NetcoreIgnoreName = 'netcoreIgnore';
const AlternativeSolutionFoldersName = 'altSolutionFolders';
const XmlSpacesName = 'xmlspaces';
const XmlClosingTagSpace = 'xmlClosingTagSpace';
const Win32EncodingName = 'win32Encoding';
const CreateTemplateFolderQuestion = 'createTemplateFolderQuestion';
const LineEndings = 'lineEndings';

let config: vscode.WorkspaceConfiguration = null;

export function register() {
    config = vscode.workspace.getConfiguration(ConfigurationName);
}

export function getItemTypes(): { [id: string]: string } {
    return config.get<{ [id: string]: string }>(ItemTypesName, {
        "*": "Content",
        "cs": "Compile",
        "cpp": "ClCompile",
        "cc": "ClCompile",
        "c": "ClCompile",
        "h": "ClInclude",
        "hpp": "ClInclude",
        "vb": "Compile",
        "fs": "Compile",
        "ts": "TypeScriptCompile",
        "xaml": "EmbeddedResource"
    });
}

export function getShowMode(): string {
    return config.get<string>(ShowModeName, SHOW_MODE_ACTIVITYBAR);
}

export function getSolutionExplorerIcons(): string {
    return config.get<string>(SolutionExplorerIconsName, ICONS_CUSTOM);
}

export function getTrackActiveItem(): boolean {
    return config.get<boolean>(TrackActiveItemName, false);
}

export function getShowOutputChannel(): boolean {
    return config.get<boolean>(ShowOutputChannelName, true);
}

export function getNetCoreIgnore(): string[] {
    return config.get<string[]>(NetcoreIgnoreName, [ "bin", "node_modules", "obj", ".ds_store" ]);
}

export function getAlternativeSolutionFolders(): string[] {
    return config.get<string[]>(AlternativeSolutionFoldersName, [ "src" ]);
}

export function getXmlSpaces(): string | number {
    let value = config.get<string>(XmlSpacesName, "2");
    if (isNaN(parseInt(value))) {
        return value;
    } else {
        return parseInt(value);
    }
}

export function getXmlClosingTagSpace(): boolean {
    return config.get<boolean>(XmlClosingTagSpace, false);
}

export function getWin32EncodingTable(): { [id: string]: string } {
    return config.get<{ [id: string]: string }>(Win32EncodingName, {
        "932": "Shift_JIS",
        "936": "GBK",
        "950": "BIG5"
    });
}

export function getCreateTemplateFolderQuestion() : boolean {
    return config.get<boolean>(CreateTemplateFolderQuestion, true);
}


export function getLineEndings() : LineEndingsType {
    return config.get<LineEndingsType>(LineEndings, "lf");
}

export type LineEndingsType = "lf" | "crlf";

export const ICONS_THEME = "current-theme";
export const ICONS_MIXED = "mix";
export const ICONS_CUSTOM = "solution-explorer";

export const SHOW_MODE_ACTIVITYBAR = "activityBar";
export const SHOW_MODE_EXPLORER = "explorer";
export const SHOW_MODE_NONE = "none";