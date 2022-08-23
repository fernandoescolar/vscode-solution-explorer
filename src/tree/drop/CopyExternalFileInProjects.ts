import { TreeItem, ContextValues } from "@tree";
import { Action, CopyFile } from "@actions";
import { DropHandler } from "./DropHandler";

export class CopyExternalFileInProjects extends DropHandler {
    public async canHandle(source: TreeItem, target: TreeItem): Promise<boolean> {
        return source.contextValue === ContextValues.projectFile
            && source.project !== target.project
            || source.contextValue === ContextValues.solutionFile;
    }

    public async handle(source: TreeItem, target: TreeItem): Promise<Action[]> {
        const targetpath = await DropHandler.findPath(target);
        if (!target.project || !source.path || targetpath === undefined) { return []; }
        return [ new CopyFile(target.project, source.path, targetpath) ];
    }
}
