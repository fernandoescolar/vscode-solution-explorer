import * as vscode from "vscode";
import { ItemsOrItemsResolver } from "./ItemsOrItemsResolver";
import { TextValue } from "./TextValue";
import { WizardContext } from "./WizardContext";

export function selectOption(placeholder: string, items: ItemsOrItemsResolver): Promise<string | undefined>;
export function selectOption(placeholder: string, items: ItemsOrItemsResolver, selected: TextValue): Promise<string | undefined>;
export function selectOption(placeholder: string, items: ItemsOrItemsResolver, wizard: WizardContext): Promise<string | undefined>;
export function selectOption(placeholder: string, items: ItemsOrItemsResolver, selected: TextValue, wizard: WizardContext): Promise<string | undefined>;
export async function selectOption(placeholder: string, items: ItemsOrItemsResolver, selected?: TextValue | WizardContext, wizard?: WizardContext): Promise<string | undefined> {
    if (selected && typeof selected !== "string" && typeof selected !== "function") {
        wizard = selected;
        selected = undefined;
    }

    if (selected && typeof selected === "function") {
        selected = await selected();
    }

    if (typeof(items) === 'function') {
        items = await items();
    }

    const validate: (value: string) => boolean = value => {
        if (value !== null && value !== undefined) {
            return true;
        }

        return false;
    };

    const getItemValue = (value: string): string | undefined => {
        if (Array.isArray(items)) { return value; }
        if (typeof items === 'object') { return items[value]; }
    }

    const options = Array.isArray(items) ? items : Object.keys(items);
    if (options.length <= 0) {
        wizard?.next();
        return;
    }

    if (options.length === 1) {
        wizard?.next();
        return getItemValue(options[0]);
    }

    const result = new Promise<string | undefined>((resolve, reject) => {
        let accepted = false;
        const input = vscode.window.createQuickPick();
        input.title = wizard?.title;
        input.step = wizard ? wizard.step + 1 : undefined;
        input.totalSteps = wizard?.totalSteps;
        input.placeholder = placeholder;
        input.canSelectMany = false;
        input.items = options.map(s => { return { label: s } as vscode.QuickPickItem; });
        input.value = selected as string || "";

        input.onDidTriggerButton(item => {
            if (item === vscode.QuickInputButtons.Back) {
                wizard?.prev();
                resolve(input.activeItems[0].label);
            } else {
                if (validate(input.activeItems[0].label)) {
                    accepted = true;
                    wizard?.next();
                    resolve(getItemValue(input.activeItems[0].label));
                } else  {
                    wizard?.cancel();
                    resolve(undefined);
                }
            }

            input.hide();
        });

        input.onDidAccept(() => {
            if (validate(input.activeItems[0].label)) {
                accepted = true;
                wizard?.next();
                resolve(getItemValue(input.activeItems[0].label));
            } else {
                wizard?.cancel();
                resolve(undefined);
            }

            input.hide();
        });

        input.show();
    });

    return await result;
}
