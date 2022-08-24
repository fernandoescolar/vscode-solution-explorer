import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem, ContextValues } from "@tree";
import { Action, CreateProjectFile, OpenFile } from "@actions";
import { ActionCommand } from "@commands/base";

export class CreateFileCommand extends ActionCommand {
    private workspaceRoot: string = '';
    private defaultExtension: string = '';
    private wizard: dialogs.Wizard | undefined;

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Create file');
    }

    protected shouldRun(item: TreeItem): boolean {
        return item && !!item.project;
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        this.workspaceRoot = item.workspaceRoot;
        this.defaultExtension = item.project.fileExtension;



        this.wizard = dialogs.wizard(this.title)
                             .getText('New file name', 'file.extension')
                             .selectOption('Select template', () => this.getTemplatesTypes());

        const parameters = await this.wizard.run();
        if (!parameters) {
            return [];
        }

        const content = await this.getContent(item, parameters[0], parameters[1]);
        const folderpath: string = this.getFolderPath(item);
        const filename = this.getFilename(parameters[0]);
        const filepath = path.join(folderpath, filename);

        return [
            new CreateProjectFile(item.project, folderpath, filename, content),
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
        const templateEngine = this.provider.getTemplateEngine(this.workspaceRoot);
        let result: string[] = [];
        if (templateEngine) {
            result = await this.provider.getTemplateEngine(this.workspaceRoot).getTemplates(extension);
        }

        return result;
    }

    private async getContent(item: TreeItem, filename: string, templateName: string): Promise<string> {
        if (!templateName) { return ""; }

        const templateEngine = this.provider.getTemplateEngine(this.workspaceRoot);
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