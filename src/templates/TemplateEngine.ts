import * as Handlebars from "handlebars";
import * as path from "path";
import * as fs from "../async/fs";
import { ITemplate } from "./ITemplate";
import { TreeItem, ContextValues } from "../tree";

const TemplateFoldername: string = "solution-explorer";
const VsCodeFoldername: string = ".vscode";
const TemplateFilename: string = "template-list.json";
const SourceFolder: string = path.join(__dirname, "..", "files-vscode-folder");

export class TemplateEngine {
    private readonly workspaceRoot: string;
    private readonly vscodeFolder: string;
    private readonly workingFolder: string;
    private readonly templateFile: string;
    
    private templates: ITemplate[];
    

    constructor(workspaceRoot: string) {
        this.workspaceRoot = workspaceRoot;
        this.vscodeFolder = path.join(workspaceRoot, VsCodeFoldername);
        this.workingFolder = path.join(workspaceRoot, VsCodeFoldername, TemplateFoldername);
        this.templateFile = path.join(workspaceRoot, VsCodeFoldername, TemplateFoldername, TemplateFilename);
    }

    public async getTemplates(extension: string): Promise<string[]> {
        if (!this.templates) {
            if (!(await fs.exists(this.templateFile))) return [];
            
            let content = await fs.readFile(this.templateFile, "utf8");
            this.templates = JSON.parse(content).templates;
        }

        let result: string[] = [];
        this.templates.forEach(t => {
            if (t.extension.toLocaleLowerCase() == extension.toLocaleLowerCase()) {
                result.push(t.name);
            }
        });

        return result;
    }

    public async generate(filename: string, templateName: string, item: TreeItem): Promise<string> {
        let extension = path.extname(filename).substring(1);
        let index = this.templates.findIndex(t => t.extension.toLocaleLowerCase() == extension.toLocaleLowerCase() && t.name == templateName);
        if (index < 0) return;

        let template = this.templates[index];
        let content = await fs.readFile(path.join(this.workingFolder, template.file), "utf8");
        let handlebar = Handlebars.compile(content);
        let parameters = await this.getParameters(template, filename, item)
        let result = handlebar(parameters);
        return result;
    }

    public async existsTemplates(): Promise<boolean> {
		return await fs.exists(this.templateFile);
    }
    
    public async creteTemplates(): Promise<void> {
        if (!(await fs.exists(this.vscodeFolder)))
			await fs.mkdir(this.vscodeFolder);

		await this.copyFolder(SourceFolder, this.workingFolder);
    }

    private async getParameters(template: ITemplate, filename: string, item: TreeItem): Promise<{[id: string]: string}> {
        const filepath = path.join(this.workingFolder, template.parameters).replace(/\\/g, '\\\\');
        const parametersGetter = eval(`require('${filepath}')`);
        if (parametersGetter) {
            let result = parametersGetter(filename, item.project ? item.project.fullPath : null, item.contextValue.startsWith(ContextValues.ProjectFolder) ? item.path : null);
            if (Promise.resolve(result) === result) {
                result = await (<Promise<any>>result);
            }

            return result;
        }

        return null;
    }

	private async copyFolder(src: string, dest: string): Promise<void> {
		var exists = await fs.exists(src);
		var stats = exists && await fs.lstat(src);
		var isDirectory = exists && stats.isDirectory();
		if (exists && isDirectory) {
            if (!(await fs.exists(dest)))
                await fs.mkdir(dest);
                
			let items = await fs.readdir(src);
			for(let i = 0; i < items.length; i++) {
				let childItemName = items[i];
				await this.copyFolder(path.join(src, childItemName), path.join(dest, childItemName));
			}
		} else {
			let content = await fs.readFile(src, "binary");
			await fs.writeFile(dest, content, "binary");
		}
	}
}