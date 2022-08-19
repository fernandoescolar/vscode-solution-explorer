import { ICommandParameter } from "@commands/base";

export class StaticCommandParameter implements ICommandParameter {
    constructor(private readonly value: string, private readonly option?: string) {
    }

    public setArguments(): Promise<void> {
        return Promise.resolve();
    }

    public get shouldAskUser(): boolean { return false; }

    public getArguments(): string[] {
        if (this.option) {
            return [ this.option, this.value || "" ];
        }

        return [ this.value  || "" ];
    }

}