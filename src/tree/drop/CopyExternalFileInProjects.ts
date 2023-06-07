import { TreeItem, ContextValues } from "@tree";
import { Action, CopyProjectFile } from "@actions";
import { DropHandler } from "./DropHandler";

export class CopyExternalFileInProjects extends DropHandler {
    public async canHandle(source: TreeItem, target: TreeItem): Promise<boolean> {
        return ContextValues.matchAnyLanguage(ContextValues.projectFile, source.contextValue)
            && source.project !== target.project;
    }

    public async handle(source: TreeItem, target: TreeItem): Promise<Action[]> {
        const targetpath = await DropHandler.findPath(target);
        if (!target.project || !source.path || targetpath === undefined) { return []; }
        return [ new CopyProjectFile(target.project, source.path, targetpath) ];
    }
}
