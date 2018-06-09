import { StandardProjectTreeItem } from "./StandardProjectTreeItem";

export class DeployProjectTreeItem extends StandardProjectTreeItem {
    protected addContextValueSuffix(): void {
		this.contextValue += '-standard';
	}
}