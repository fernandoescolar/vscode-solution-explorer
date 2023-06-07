import { TreeItem, ContextValues } from "@tree";
import { Action, MoveProjectFile } from "@actions";
import { DropHandler } from "./DropHandler";

export class MoveFileInTheSameProject extends DropHandler {
    public async canHandle(source: TreeItem, target: TreeItem): Promise<boolean> {
        return ContextValues.matchAnyLanguage(ContextValues.projectFile, source.contextValue) 
            && source.project === target.project;
    }

    public async handle(source: TreeItem, target: TreeItem): Promise<Action[]> {
        const targetpath = await DropHandler.findPath(target);
        if (!target.project || !source.path || targetpath === undefined) { return []; }
        return [ new MoveProjectFile(target.project, source.path, targetpath) ];
    }
}
