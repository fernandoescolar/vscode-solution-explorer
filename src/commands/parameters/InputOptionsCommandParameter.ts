import * as vscode from "vscode";
import { ICommandParameter } from "../base/ICommandParameter";
import { CommandParameterCompiler } from "../base/CommandParameterCompiler";

export type ItemsResolver = () => Promise<string[]>;

export type MapItemsResolver = () => Promise<{ [id: string]: string }>;

export type ItemsOrItemsResolver = string[] | ItemsResolver | { [id: string]: string } | MapItemsResolver;

export class InputOptionsCommandParameter implements ICommandParameter {
    private value: string;
    private _items: string[] | { [id: string] : string };

    constructor(private readonly placeholder: string, private readonly items: ItemsOrItemsResolver, private readonly option?: string) {
    }

    public get shouldAskUser(): boolean { return true; }
    
    public async setArguments(state: CommandParameterCompiler): Promise<void> {
        const validate: (value: string) => boolean = value => {
            if (value !== null && value !== undefined) {
                this.value = this.getValue(value);
                return true;
            }
            
            return false;
        };
        let items = await this.getItems();

        if (items.length <= 0) {
            state.next();
            return;
        }

        if (items.length == 1) {
            this.value = this.getValue(items[0]);
            state.next();
            return;
        } 

        items.sort((a, b) => {
            let x = a.toLowerCase();
            let y = b.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        let accepted = false;
        const input = vscode.window.createQuickPick();
        input.title = state.title;
        input.step = state.step;
        input.totalSteps = state.steps;
        input.placeholder = this.placeholder;
        input.items = this.createQuickPickItems(items);
        input.onDidTriggerButton(item => {
            if (item === vscode.QuickInputButtons.Back) {
                state.prev();
            } else {
                if (validate(input.activeItems[0].label)) {
                    accepted = true;
                    state.next();
                } else  {
                    state.cancel();
                }
            }
        });
        input.onDidAccept(() => {
            if (validate(input.activeItems[0].label)) {
                accepted = true;
                state.next();
            } else {
                state.cancel();
            }
        });

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

    private async getItems(): Promise<string[]> {
        if (typeof(this.items) == 'function') {
            this._items = await this.items();
            
        } else {
            this._items = this.items;
        }
       
        return this.parseItems(this._items);
    }

    private parseItems(items: string[] | { [id: string]: string }): string[] {
        if (Array.isArray(items)) return items;
        return Object.keys(items);
    }

    private getValue(value: string) {
        if (Array.isArray(this._items)) return value;
        return this._items[value];
    }

    private createQuickPickItems(strings: string[]): vscode.QuickPickItem[] {
        return strings.map(s => { return { label: s } as vscode.QuickPickItem; });
    }
}