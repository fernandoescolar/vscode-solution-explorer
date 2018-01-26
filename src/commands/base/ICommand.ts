import { TreeItem } from '../../tree';

export interface ICommand {
    run(item: TreeItem): Promise<void>;
}