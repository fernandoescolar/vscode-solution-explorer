import * as config from "@extensions/config";
import { TerminalCommand } from "@extensions/defaultTerminalCommands";
import { TerminalAction } from "./TerminalAction";

export type CustomTerminalOptions = {
    name: TerminalCommand;
    parameters: { [id: string]: string };
    workingFolder: string;
};

export abstract class CustomTerminalAction extends TerminalAction {
    constructor(options: CustomTerminalOptions) {
        super(CustomTerminalAction.getCustomArguments(options.name, options.parameters), options.workingFolder);
    }

    protected static getCustomArguments(name: TerminalCommand, parameters: { [id: string]: string; }): string[] {
        const replacements = Object.keys(parameters).map(key => ({ search: "$" + key, value: parameters[key] }));

        // optional parameters (empty string) drop their preceding "-flag" token entirely,
        // rather than being passed through as an empty/quoted-empty argument
        const emptySearches = replacements.filter(r => r.value === "").map(r => r.search);
        const args: string[] = [];
        config.getCustomCommands(name).forEach(arg => {
            if (emptySearches.some(search => arg.includes(search))) {
                if (args.length > 0 && args[args.length - 1].startsWith("-")) {
                    args.pop();
                }
                return;
            }
            args.push(arg);
        });

        for(let i = 0; i < args.length; i++) {
            replacements.forEach(replacement => {
                args[i] = args[i].replace(replacement.search, CustomTerminalAction.escapeShellArgument(replacement.value));
            });
        }

        return args;
    }

    private static escapeShellArgument(arg: string): string {
        if (process.platform === "win32") {
            return `"${arg.replace(/"/g, '""')}"`;
        }

        return `${arg.replace(/'/g, "\"")}`;
    }
}
