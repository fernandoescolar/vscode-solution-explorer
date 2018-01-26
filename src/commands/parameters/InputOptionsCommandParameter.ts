import * as vscode from "vscode";
import { ICommandParameter } from "../base/ICommandParameter";

export type ItemsResolver = () => Promise<string[]>;

export type ItemsOrItemsResolver = string[] | ItemsResolver;

export class InputOptionsCommandParameter implements ICommandParameter {
    private value: string;

    constructor(private readonly placeholder: string, private readonly items: ItemsOrItemsResolver, private readonly option?: string) {
    }
    
    public async setArguments(): Promise<boolean> {
        let items = await this.getItems();
        let value = await vscode.window.showQuickPick(items, { placeHolder: this.placeholder });
        if (value !== null && value !== undefined) {
            this.value = value;
            return true;
        }

        return false;
    }

    public getArguments(): string[] {
        if (this.option)
            return [ this.option, this.value ];

        return [ this.value ];
    }

    private async getItems(): Promise<string[]> {
        if (Array.isArray(this.items)) return this.items;
        else return await this.items();
    }
}