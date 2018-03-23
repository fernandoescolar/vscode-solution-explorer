import { StandardProjectTreeItem } from "./StandardProjectTreeItem";
import { FileEvent } from "../../../events";

export class SharedProjectTreeItem extends StandardProjectTreeItem {
    
    protected shouldHandleFileEvent(fileEvent: FileEvent): boolean {
        let path = this.path.replace(".shproj", ".projitems");
        return fileEvent.path == path;
    }

    protected addContextValueSuffix(): void {
		this.contextValue += '-standard';
	}
}