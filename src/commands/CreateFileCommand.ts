import * as vscode from "vscode";
import * as path from "path";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";
import { InputOptionsCommandParameter } from "./parameters/InputOptionsCommandParameter";
import { TemplateEngine } from "../templates/TemplateEngine";

export class CreateFileCommand extends CommandBase {

    private readonly templates: TemplateEngine = new TemplateEngine(path.join(__filename, "..", "..", "..", "file-templates"));

    constructor(private readonly provider: SolutionExplorerProvider) {
        super();

        this.parameters = [
            new InputTextCommandParameter('New file name'),
            new InputOptionsCommandParameter('Select template', () => this.getTemplatesTypes()),
        ];
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item.project;
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
        let extension = path.extname(this.args[0]).substring(1);
        let result: string[] =  await this.templates.getTemplates(extension);
        return result;
    }

    private getContent(item: TreeItem): Promise<string> {
        if (!this.args[1]) return Promise.resolve("");

        let extension = path.extname(this.args[0]).substring(1);
        let parameters = {
            namespace: this.getNamespace(item),
            name: path.basename(this.args[0], "." + extension)
        };

        return this.templates.generate(extension, this.args[1], parameters);
    }

    private getNamespace(item: TreeItem): string {
        let result = "Unknown";
        if (item.project) {
            result = path.basename(item.project.fullPath, path.extname(item.project.fullPath));
            if (item.contextValue.startsWith(ContextValues.ProjectFolder)) {
                result += "." + item.path.replace(path.dirname(item.project.fullPath), "").substring(1).replace(/[\\\/]/g, ".");
            }
        }       

        return result;
    }
}