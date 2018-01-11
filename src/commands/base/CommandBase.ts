import { TreeItem } from '../../tree';
import { ICommandParameter } from './ICommandParameter';

export abstract class CommandBase {
    protected parameters: ICommandParameter[];

    public async Run(item: TreeItem): Promise<string[]> {
        if (!this.ShouldRun(item)) return;

        let args = await this.GetArguments();
        if (!args)return [];
        
        return await this.RunCommand(item, args);
    }

    protected async GetArguments() : Promise<string[]> {
        if (!this.parameters) return [];

        let args: string[] = [];
        for (let i = 0; i < this.parameters.length; i++) {
            let parameter = this.parameters[i];
            let success = await parameter.setArguments();
            if (!success) return;

            args = args.concat(parameter.getArguments());
        }

        return args;
    }

    protected ShouldRun(item: TreeItem): boolean {
        return true;
    }

    protected abstract RunCommand(item: TreeItem, args: string[]): Promise<string[]>;
}