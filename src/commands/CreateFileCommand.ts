import * as vscode from "vscode";
import * as path from "path";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";
import { InputOptionsCommandParameter } from "./parameters/InputOptionsCommandParameter";

export class CreateFileCommand extends CommandBase {
    private _workspaceRoot: string = '';
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
            return true;
        }
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0) return;

        try {
            let targetpath: string = item.path;
            if (!item.contextValue.startsWith(ContextValues.ProjectFolder))
                targetpath = path.dirname(targetpath);

            let content = await this.getContent(item);
            let filepath = await item.project.createFile(targetpath, args[0], content);
            let document = await vscode.workspace.openTextDocument(filepath);
            vscode.window.showTextDocument(document);
            this.provider.logger.log("File created: " + filepath);
        } catch(ex) {
            this.provider.logger.error('Can not create file: ' + ex);
        }
    }

    private async getTemplatesTypes(): Promise<string[]> {
        const extension = path.extname(this.args[0]).substring(1);
        const templateEngine = this.provider.getTemplateEngine(this._workspaceRoot);
        let result: string[] = [];
        if (templateEngine) {
            result = await this.provider.getTemplateEngine(this._workspaceRoot).getTemplates(extension);
        }

        return result;
    }

    private getContent(item: TreeItem): Promise<string> {
        if (!this.args[1]) return Promise.resolve("");
        const templateEngine = this.provider.getTemplateEngine(this._workspaceRoot);
        if (templateEngine) {
            return templateEngine.generate(this.args[0], this.args[1], item);
        }

        return Promise.resolve("");
    }
}