import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { TreeItem, ContextValues } from "@tree";
import { Action, CreateProjectFile, CreateProjectFolder } from "@actions";
import { DropHandler } from "./DropHandler";
import { Project } from "@core/Projects";


export class CopyExternalFolderInProjects extends DropHandler {
    public async canHandle(source: TreeItem, target: TreeItem): Promise<boolean> {
        return ContextValues.matchAnyLanguage(ContextValues.projectFolder, source.contextValue)
            && source.project !== target.project;
    }

    public async handle(source: TreeItem, target: TreeItem): Promise<Action[]> {

        const targetpath = await DropHandler.findPath(target);
        const folderName = source.label;
        if (!target.project || !source.path || targetpath === undefined || !folderName) { return []; }

        const folderpath = path.join(targetpath, folderName);

        const actions: Action[] = [];
        await this.fillActions(actions, target.project, targetpath, source);

        return actions;
    }

    private async fillActions(actions: Action[], project: Project, targetpath: string, source: TreeItem) {
        if (!source.path) { return; }

        const fullFolderPath = path.join(path.dirname(project.fullPath), targetpath);
        if (source.contextValue === ContextValues.projectFolder) {
            targetpath = path.join(targetpath, source.label);
            actions.push(new CreateProjectFolder(project, fullFolderPath));
        }

        if (source.contextValue === ContextValues.projectFile) {
            const filename = source.label;
            const content = await fs.readFile(source.path);
            actions.push(new CreateProjectFile(project, fullFolderPath, filename, content));
        }

        const children = await source.getChildren();
        for (const child of children) {
            await this.fillActions(actions, project, targetpath, child);
        }
    }
}
