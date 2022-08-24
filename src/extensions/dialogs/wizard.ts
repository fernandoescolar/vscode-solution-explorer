import { getText } from "./getText";
import { TextValue } from "./TextValue";
import { searchOption } from "./searchOption";
import { SearchResolver } from "./SearchResolver";
import { selectOption } from "./selectOption";
import { ItemsOrItemsResolver } from "./ItemsOrItemsResolver";
import { WizardContext } from "./WizardContext";

export function wizard(title: string): Wizard {
    return new Wizard(title);
}

type WizardStep = (context: WizardContext) => Promise<string | undefined>;

export class Wizard {
    private stepList: WizardStep[] = [];
    private currentContext: WizardContext | undefined;

    constructor(private readonly title: string) {
    }

    public get context(): WizardContext | undefined {
        return this.currentContext;
    }

    public getText(description: string, placeholder?: string, initialValue?: TextValue): Wizard {
        this.stepList.push((context) => getText(description, placeholder || "", initialValue || "", context));
        return this;
    }

    public selectOption(placeholder: string, items: ItemsOrItemsResolver, selected?: TextValue): Wizard {
        this.stepList.push((context) => selectOption(placeholder, items, selected || "", context));
        return this;
    }

    public searchOption(placeholder: string, items: SearchResolver, selected?: string): Wizard {
        this.stepList.push((context) => searchOption(placeholder, selected || "", items, context));
        return this;
   }

    public async run(): Promise<string[] | undefined> {
        const context = this.createWizardContext();
        this.currentContext = context;
        while(context.step < context.totalSteps) {
            const step = context.step;
            const result = await this.stepList[step](context);
            if (result === undefined) {
                return undefined;
            }
            if (context.cancelled) {
                return undefined;
            }

            context.results[step] = result;
        }

        return context.results;
    }

    private createWizardContext(): WizardContext {
        const context = {
            title: this.title,
            step: 0,
            totalSteps: this.stepList.length,
            cancelled: false,
            results: new Array<string>(this.stepList.length),
            prev: () => { if (context.step > 0) { context.step--; } },
            next: () => { if (context.step < context.totalSteps) { context.step++; } },
            cancel: () => { context.cancelled = true; },
        };

       return context;
    }
}