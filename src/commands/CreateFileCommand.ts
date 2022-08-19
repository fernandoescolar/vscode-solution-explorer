import * as vscode from "vscode";
import * as path from "@extensions/path";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem, ContextValues } from "@tree";
import { CommandBase } from "@commands/base";
import { InputTextCommandParameter } from "@commands/parameters/InputTextCommandParameter";
import { InputOptionsCommandParameter } from "@commands/parameters/InputOptionsCommandParameter";

export class CreateFileCommand extends CommandBase {
    private _workspaceRoot: string = '';
    private _defaultExtension: string = '';
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Create file');

        this.parameters = [
            new InputTextCommandParameter('New file name', 'file.extension'),
            new InputOptionsCommandParameter('Select template', () => this.getTemplatesTypes()),
        ];
    }

    protected shouldRun(item: TreeItem): boolean {
        if(!!item.project) {
            this._workspaceRoot = item.workspaceRoot;
            this._defaultExtension = item.project.fileExtension;
            return true;
        }

        return false;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0 || !item || !item.project || !item.path) { return; }

        try {
            let targetpath: string = item.path;
            if (!item.contextValue.startsWith(ContextValues.projectFolder)) {
                targetpath = path.dirname(targetpath);
            }

            const content = await this.getContent(item);
            const filename = this.getFilename(args[0]);
            const filepath = await item.project.createFile(targetpath, filename, content);
            const document = await vscode.workspace.openTextDocument(filepath);
            vscode.window.showTextDocument(document);
            this.provider.logger.log("File created: " + filepath);
        } catch(ex) {
            this.provider.logger.error('Can not create file: ' + ex);
        }
    }

    private async getTemplatesTypes(): Promise<string[]> {
        const extension = (path.extname(this.args[0]) || this._defaultExtension ).substring(1);
        const templateEngine = this.provider.getTemplateEngine(this._workspaceRoot);
        let result: string[] = [];
        if (templateEngine) {
            result = await this.provider.getTemplateEngine(this._workspaceRoot).getTemplates(extension);
        }

        return result;
    }

    private async getContent(item: TreeItem): Promise<string> {
        if (!this.args[1]) { return ""; }

        const templateEngine = this.provider.getTemplateEngine(this._workspaceRoot);
        if (templateEngine) {
            const filename = this.getFilename(this.args[0]);
            return await templateEngine.generate(filename, this.args[1], item) || "";
        }

        return "";
    }

    private getFilename(filename: string): string {
        return path.extname(filename) ? filename :filename + this._defaultExtension;
    }
}