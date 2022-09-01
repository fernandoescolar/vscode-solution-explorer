import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { ContextValues, TreeItem } from "@tree";
import { Action } from "@actions";

export abstract class DropHandler {
    public abstract canHandle(source: TreeItem, target: TreeItem): Promise<boolean>;

    public abstract handle(source: TreeItem, target: TreeItem): Promise<Action[]>;

    protected static async findPath(item: TreeItem): Promise<string | undefined> {
        if (item.path) {
            const isDirectory = await fs.isDirectory(item.path);
            if (isDirectory) {
                if (item.project) {
                    const basepath = path.dirname(item.project.fullPath);
                    return path.relative(basepath, item.path);
                } else {
                    return item.path;
                }
            }
        }

        if (item.contextValue === ContextValues.project + '-cps') {
            return "";
        }

        if (item.contextValue === ContextValues.project + '-standard') {
            return "";
        }

        if (item.parent) {
            return DropHandler.findPath(item.parent);
        }

        return undefined;
    }
}
