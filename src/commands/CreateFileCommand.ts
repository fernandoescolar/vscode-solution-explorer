import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { TreeItem, ContextValues } from "@tree";
import { Action, CreateProjectFile, OpenFile } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { TemplateEngineCollection } from "@templates";
import { Direction, RelativeFilePosition } from "@core/Projects/RelativeFilePosition";

export class CreateFileCommand extends SingleItemActionsCommand {
    private workspaceRoot: string = '';
    private defaultExtension: string = '';
    private wizard: dialogs.Wizard | undefined;

    constructor(private readonly templaceEngineCollection: TemplateEngineCollection, private readonly relativeToSelected?: Direction) {
        super('Create file');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.project;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        this.workspaceRoot = item.workspaceRoot;
        this.defaultExtension = item.project.fileExtension;
        const relativeTo : RelativeFilePosition | undefined = 
            !this.relativeToSelected ? 
            undefined : 
            { 
                fullpath: item.path,
                direction: this.relativeToSelected
            };

        this.wizard = dialogs.wizard(this.title)
                             .getText('New file name', 'file.extension')
                             .selectOption('Select template', () => this.getTemplatesTypes());

        const parameters = await this.wizard.run();
        if (!parameters) {
            if (this.wizard?.context?.results[0]) {
                const folderpath = this.getFolderPath(item);
                const filename = this.getFilename(this.wizard.context.results[0]);
                return [
                    new CreateProjectFile(item.project, folderpath, filename, undefined, relativeTo),
                    new OpenFile(path.join(folderpath, filename))
                ];
            }
            return [];
        }

        const content = await this.getContent(item, parameters[0], parameters[1]);
        const folderpath: string = this.getFolderPath(item);
        const filename = this.getFilename(parameters[0]);
        const filepath = path.join(folderpath, filename);

        return [
            new CreateProjectFile(item.project, folderpath, filename, content, relativeTo),
            new OpenFile(filepath)
        ];
    }

    private getFolderPath(item: TreeItem) {
        let targetpath: string = item.path || "";
        if (!item.contextValue.startsWith(ContextValues.projectFolder)) {
            targetpath = path.dirname(targetpath);
        }
        return targetpath;
    }

    private async getTemplatesTypes(): Promise<string[]> {
        const extension = (path.extname(this.wizard?.context?.results[0] || "") || this.defaultExtension ).substring(1);
        const templateEngine = this.templaceEngineCollection.getTemplateEngine(this.workspaceRoot);
        let result: string[] = [];
        if (templateEngine) {
            result = await this.templaceEngineCollection.getTemplateEngine(this.workspaceRoot).getTemplates(extension);
        }

        return result;
    }

    private async getContent(item: TreeItem, filename: string, templateName: string): Promise<string> {
        if (!templateName) { return ""; }

        const templateEngine = this.templaceEngineCollection.getTemplateEngine(this.workspaceRoot);
        if (templateEngine) {
            filename = this.getFilename(filename);
            return await templateEngine.generate(filename, templateName, item) || "";
        }

        return "";
    }

    private getFilename(filename: string): string {
        return path.extname(filename) ? filename : filename + this.defaultExtension;
    }
}