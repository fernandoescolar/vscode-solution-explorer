import * as vscode from "vscode";

const ConfigurationName = 'vssolution';
const ItemTypesName = 'xxprojItemTypes';
const ShowInExplorerName = 'showInExplorer';
const UseSolutionExplorerIconsName = 'useSolutionExplorerIcons';
const ShowOutputChannelName = 'showOutputChannel';
const NetcoreIgnoreName = 'netcoreIgnore';

let config: vscode.WorkspaceConfiguration = null;

export function register() {
    config = vscode.workspace.getConfiguration(ConfigurationName);
}

export function getItemTypes(): { [id: string]: string } {
    return config.get<{ [id: string]: string }>(ItemTypesName, {
        "*": "Content",
        "cs": "Compile",
        "vb": "Compile",
        "fs": "Compile",
        "ts": "TypeScriptCompile"
    });
}

export function getShowInExplorer(): boolean {
    return config.get<boolean>(ShowInExplorerName, true);
}

export function getUseSolutionExplorerIcons(): boolean {
    return config.get<boolean>(UseSolutionExplorerIconsName, true);
}

export function getShowOutputChannel(): boolean {
    return config.get<boolean>(ShowOutputChannelName, true);
}

export function getNetCoreIgnore(): string[] {
    return config.get<string[]>(NetcoreIgnoreName, [ "bin", "node_modules", "obj", ".ds_store" ]);
}