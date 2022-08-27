import * as vscode from "vscode";
import { SearchResolver } from "./SearchResolver";
import { WizardContext } from "./WizardContext";

export async function searchOption(placeholder: string, initialSearch: string, itemsResolver: SearchResolver, wizard?: WizardContext): Promise<string | undefined> {
    let items: string[] | { [id: string]: string } = [];

    const validate: (value: string) => boolean = value => {
        if (value !== null && value !== undefined) {
            if (Array.isArray(items)) { return items.indexOf(value) >= 0; }
            if (typeof items === 'object') { return !!items[value]; }
        }

        return false;
    };

    const getItemValue = (value: string): string | undefined => {
        if (Array.isArray(items)) { return value; }
        if (typeof items === 'object') { return items[value]; }
    }

    const getItems = async (search: string): Promise<vscode.QuickPickItem[]> => {
        items = await itemsResolver(search);
        const options = Array.isArray(items) ? items : Object.keys(items);
        return options.map(s => { return { label: s } as vscode.QuickPickItem; });
    };


    const result = new Promise<string | undefined>(async (resolve, reject) => {
        let accepted = false;
        const input = vscode.window.createQuickPick();
        input.title = wizard?.title;
        input.step = wizard ? wizard.step + 1 : undefined;
        input.totalSteps = wizard?.totalSteps;
        input.placeholder = placeholder;
        input.canSelectMany = false;
        input.items = [];
        input.value = initialSearch;

        input.onDidChangeValue(async (value) => {
            if (value) {
                input.busy = true;
                input.items = await getItems(value);
                input.busy = false;
            }
        });

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
        input.busy = true;
        input.items = await getItems(initialSearch);
        input.busy = false;
    });

    return await result;
}
