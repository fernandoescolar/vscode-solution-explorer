import * as vscode from "vscode";
import * as config from "@extensions/config";

const TERMINAL_NAME:string = "solution-explorer";

function ensureTerminal(path: string): vscode.Terminal {
    let terminal: vscode.Terminal | undefined;
    vscode.window.terminals.forEach(t => { if(t.name === TERMINAL_NAME) { terminal = t; } });
    if (!terminal) {
        terminal = vscode.window.createTerminal({ name: TERMINAL_NAME, cwd: path });
    } else {
        terminal.sendText( [ "cd", `"${path}"` ].join(' '), true);
    }

    return terminal;
}

export function execute(args: string[], path: string): void {
    const terminal = ensureTerminal(path);
    // This is a workaround to ensure the terminal is ready to receive the command
    // If we don't wait a little bit, with some commands we kill the terminal
    setTimeout(() => {
        terminal.sendText([ ...args ].join(' '), true);
        if (config.getShowTerminalOnCommand()) {
            terminal.show();
        }
    }, 1);
}
