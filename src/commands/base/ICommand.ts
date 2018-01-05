import { TreeItem } from '../../tree';

export interface ICommand {
    Run(item: TreeItem): Promise<string[]>;
}