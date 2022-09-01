import * as vscode from "vscode";
import { TextValue } from "./TextValue";
import { WizardContext } from "./WizardContext";

export function getText(description: string): Promise<string | undefined>;
export function getText(description: string, placeholder: string, initialValue: TextValue): Promise<string | undefined>;
export function getText(description: string, placeholder: string, wizard: WizardContext): Promise<string | undefined>;
export function getText(description: string, placeholder: string, initialValue: TextValue, wizard: WizardContext): Promise<string | undefined>;
export async function getText(description: string, placeholder?: string, initialValue?: TextValue | WizardContext, wizard?: WizardContext): Promise<string | undefined> {
    let currentValue: string = "";
    if (initialValue && initialValue && typeof(initialValue) === 'function') {
        currentValue = await initialValue();
    } else if (initialValue && typeof(initialValue) !== 'string') {
        wizard = initialValue;
    } else if (initialValue && typeof(initialValue) === 'string') {
        currentValue = initialValue;
    }


    const validate: (value: string) => boolean = value => value !== null && value !== undefined;
    const result = new Promise<string | undefined>(resolve => {
        let accepted = false;
        const input = vscode.window.createInputBox();
        input.title = wizard?.title;
        input.step = wizard ? wizard.step + 1 : undefined;
        input.totalSteps = wizard?.totalSteps;
        input.prompt = description;
        input.value = currentValue;
        input.placeholder = input.value || placeholder;

        input.onDidTriggerButton(item => {
            if (item === vscode.QuickInputButtons.Back) {
                validate(input.value);
                wizard?.prev();
                resolve(input.value);
            } else {
                if (validate(input.value)) {
                    accepted = true;
                    wizard?.next();
                    resolve(input.value);
                } else {
                    wizard?.cancel();
                    resolve(undefined);
                }
            }

            input.hide();
        });

        input.onDidAccept(() => {
            if (validate(input.value)) {
                accepted = true;
                wizard?.next();
                resolve(input.value);
            } else {
                wizard?.cancel();
                resolve(undefined);
            }

            input.hide();
        }),

        input.onDidHide(() => {
            if (!accepted) {
                wizard?.cancel();
                resolve(undefined);
            }
        });

        input.show();
    });

    return await result;
}