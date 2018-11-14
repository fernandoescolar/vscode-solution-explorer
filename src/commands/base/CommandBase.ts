import { TreeItem } from '../../tree';
import { ICommandParameter } from './ICommandParameter';
import { CommandParameterCompiler } from './CommandParameterCompiler';

export abstract class CommandBase {
    protected parameters: ICommandParameter[];
    protected args: string[];

    constructor(protected title: string) {
    }

    public async run(item: TreeItem): Promise<void> {
        if (!this.shouldRun(item)) return;

        let args = await this.getArguments();
        if (!args) return;
        
        await this.runCommand(item, args);
    }

    protected async getArguments() : Promise<string[]> {
        if (!this.parameters) return [];

        const state = new CommandParameterCompiler(this.title, this.parameters);
        this.args = await state.compile();  

        return this.args;
    }

    protected shouldRun(item: TreeItem): boolean {
        return true;
    }

    protected abstract runCommand(item: TreeItem, args: string[]): Promise<void>;
}