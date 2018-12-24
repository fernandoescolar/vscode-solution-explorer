import { TreeItem } from '../../tree';
import { ICommandParameter } from './ICommandParameter';
import { CommandParameterCompiler } from './CommandParameterCompiler';

export abstract class CommandBase {

    private currentState: CommandParameterCompiler;
    protected parameters: ICommandParameter[];

    protected get args(): string[] {
        return this.currentState ? this.currentState.results : [];
    }

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

        this.currentState = new CommandParameterCompiler(this.title, this.parameters);
        const args = await this.currentState.compile();  

        return args;
    }

    protected shouldRun(item: TreeItem): boolean {
        return true;
    }

    protected abstract runCommand(item: TreeItem, args: string[]): Promise<void>;
}