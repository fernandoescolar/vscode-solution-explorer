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
        const args = config.getCustomCommands(name);
        for(let i = 0; i < args.length; i++) {
            replacements.forEach(replacement => {
                args[i] = args[i].replace(replacement.search, replacement.value);
            });
        }

        return args;
    }
}
