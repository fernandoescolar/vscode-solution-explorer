import { TreeItem, ContextValues } from "@tree";
import { Action, MoveFolder } from "@actions";
import { DropHandler } from "./DropHandler";

export class MoveFolderInTheSameProject extends DropHandler {
    public async canHandle(source: TreeItem, target: TreeItem): Promise<boolean> {
        return source.contextValue === ContextValues.projectFolder
            && source.project === target.project;
    }

    public async handle(source: TreeItem, target: TreeItem): Promise<Action[]> {
        const targetpath = await DropHandler.findPath(target);
        if (!target.project || !source.path || targetpath === undefined) { return []; }
        return [ new MoveFolder(target.project, source.path, targetpath) ];
    }
}
