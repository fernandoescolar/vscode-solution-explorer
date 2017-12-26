import * as vscode from 'vscode'
import Item from './Item'

export default class StaticTextItem extends Item {
    constructor(text: string) {
        super(text, vscode.TreeItemCollapsibleState.None, null);
    }

    public getChildren(): Item[] {
        return null;
    }
}