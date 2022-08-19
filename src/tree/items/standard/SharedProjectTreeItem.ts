import { FileEvent } from "@events";
import { StandardProjectTreeItem } from "./StandardProjectTreeItem";

export class SharedProjectTreeItem extends StandardProjectTreeItem {

    protected shouldHandleFileEvent(fileEvent: FileEvent): boolean {
        if (!this.path) { return false; }

        let path = this.path.replace(".shproj", ".projitems");
        return fileEvent.path === path;
    }

    protected addContextValueSuffix(): void {
		this.contextValue += '-standard';
	}
}
