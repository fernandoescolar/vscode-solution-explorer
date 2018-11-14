import * as vscode from "vscode";
import { ICommandParameter } from "../base/ICommandParameter";
import { CommandParameterCompiler } from "../base/CommandParameterCompiler";

export type ValueResolver = () => Promise<string>;

export class InputTextCommandParameter implements ICommandParameter {
    private value: string;

    constructor(private readonly description: string, private readonly placeholder?: string, private readonly option?: string, private readonly initialValue?: string | ValueResolver) {
    }

    public get shouldAskUser(): boolean { return true; }

    public async setArguments(state: CommandParameterCompiler): Promise<void> {
        const validate: (value: string) => boolean = value => {
            if (value !== null && value !== undefined) {
                this.value = value;
                return true;
            }

            return false;
        };
        let accepted = false;
        let input = vscode.window.createInputBox();
        input.title = state.title;
        input.step = state.step;
        input.totalSteps = state.steps;
        input.prompt = this.description;
        input.value = await this.getInitialValue();
        input.placeholder = input.value || this.placeholder;
        input.onDidTriggerButton(item => {
            if (item === vscode.QuickInputButtons.Back) {
                validate(input.value);
                state.prev();
            } else {
                if (validate(input.value)) {
                    accepted = true;
                    state.next();
                } else {
                    state.cancel();
                }
            }
        });
        input.onDidAccept(() => {
            if (validate(input.value)) {
                accepted = true;
                state.next();
            } else {
                state.cancel();
            }
        }),
        input.onDidHide(() => {
            if (!accepted) {
                state.cancel();
            }
        });
        input.show();
    }

    public getArguments(): string[] {
        if (this.option)
            return [ this.option, this.value ];

        return [ this.value ];
    }

    public getInitialValue(): Promise<string> {
        if (typeof(this.initialValue) == 'function') {
            return this.initialValue();
        }
        
        return Promise.resolve(this.initialValue);
    }
}