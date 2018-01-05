import { ICommandParameter } from "../base/ICommandParameter";

export class StaticCommandParameter implements ICommandParameter {
    constructor(private readonly value: string, private readonly option?: string) {
    }

    public setArguments(): Promise<boolean> {
        return Promise.resolve(true);
    }

    public getArguments(): string[] {
        if (this.option)
            return [ this.option, this.value ];

        return [ this.value ];
    }

}