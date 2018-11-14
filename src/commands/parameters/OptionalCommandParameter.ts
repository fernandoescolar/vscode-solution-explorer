import * as vscode from "vscode";
import { ICommandParameter } from "../base/ICommandParameter";
import { CommandParameterCompiler } from "../base/CommandParameterCompiler";

export class OptionalCommandParameter implements ICommandParameter {
    private executed: boolean = false;

    constructor(private readonly message, private readonly commandParameter: ICommandParameter) {
    }

    public get shouldAskUser(): boolean { return true; }
    
    public async setArguments(state: CommandParameterCompiler): Promise<void> {
        this.executed = false;
        const option = await this.showConfirmMessage(state);
        if (option === 'Yes') {
            this.executed = true;
            await this.commandParameter.setArguments(state);
            return;
        }

        state.next();
    }

    public getArguments(): string[] {
        if (this.executed) {
            return this.commandParameter.getArguments();
        } else {
            return [];
        }
    } 

    private showConfirmMessage(state: CommandParameterCompiler): Promise<string>
    {
        return new Promise(resolve => {
            let accepted = false;
            const input = vscode.window.createQuickPick();
            input.title = state.title;
            input.step = state.step;
            input.totalSteps = state.steps;
            input.placeholder = this.message;
            input.items = [ { label: 'Yes' }, { label: 'No' } ];   
            input.onDidAccept(() => {
                accepted = true;
                resolve(input.activeItems[0].label);
            });
            input.onDidHide(() => {
                if (!accepted) {
                    state.cancel();
                }
            });
            input.show();
        });
    }
}