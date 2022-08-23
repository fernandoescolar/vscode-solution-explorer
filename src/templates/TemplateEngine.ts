import * as Handlebars from "handlebars";
import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { TreeItem, ContextValues } from "@tree";
import { ITemplateEngine } from "./ITemplateEngine";
import { ITemplate } from "./ITemplate";

const TEMPLATE_FOLDER_NAME: string = "solution-explorer";
const VSCODE_FOLDER_NAME: string = ".vscode";
const TEMPLATE_FILE_NAME: string = "template-list.json";
const SOURCE_FOLDER: string = path.join(__dirname, "..", "files-vscode-folder");

export class TemplateEngine implements ITemplateEngine {
    private readonly workspaceRoot: string;
    private readonly vscodeFolder: string;
    private readonly workingFolder: string;
    private readonly templateFile: string;

    private templates: ITemplate[] | undefined;


    constructor(workspaceRoot: string) {
        this.workspaceRoot = workspaceRoot;
        this.vscodeFolder = path.join(workspaceRoot, VSCODE_FOLDER_NAME);
        this.workingFolder = path.join(workspaceRoot, VSCODE_FOLDER_NAME, TEMPLATE_FOLDER_NAME);
        this.templateFile = path.join(workspaceRoot, VSCODE_FOLDER_NAME, TEMPLATE_FOLDER_NAME, TEMPLATE_FILE_NAME);
    }

    public async getTemplates(extension: string): Promise<string[]> {
        if (!this.templates) {
            if (!(await fs.exists(this.templateFile))) {
                return [];
            }

            let content = await fs.readFile(this.templateFile);
            this.templates = JSON.parse(content).templates;
        }

        if (!this.templates) {
            return [];
        }

        let result: string[] = [];
        this.templates.forEach(t => {
            if (t.extension.toLocaleLowerCase() === extension.toLocaleLowerCase()) {
                result.push(t.name);
            }
        });

        return result;
    }

    public async generate(filename: string, templateName: string, item: TreeItem): Promise<string | undefined> {
        if (!this.templates) {
            return;
        }

        let extension = path.extname(filename).substring(1);
        let index = this.templates.findIndex(t => t.extension.toLocaleLowerCase() === extension.toLocaleLowerCase() && t.name === templateName);
        if (index < 0) { return; }

        let template = this.templates[index];
        let content = await fs.readFile(path.join(this.workingFolder, template.file));
        let handlebar = Handlebars.compile(content);
        let parameters = await this.getParameters(template, filename, item);
        let result = handlebar(parameters);
        return result;
    }

    public existsTemplates(): Promise<boolean> {
		return fs.exists(this.templateFile);
    }

    public async creteTemplates(): Promise<void> {
        if (!(await fs.exists(this.vscodeFolder))) {
			await fs.mkdir(this.vscodeFolder);
        }

		await this.copyFolder(SOURCE_FOLDER, this.workingFolder);
    }

    private async getParameters(template: ITemplate, filename: string, item: TreeItem): Promise<{[id: string]: string}> {
        const filepath = path.join(this.workingFolder, template.parameters).replace(/\\/g, '\\\\');
        const parametersGetter = eval(`require('${filepath}')`);
        if (parametersGetter) {
            let result = parametersGetter(filename, item.project ? item.project.fullPath : null, item.contextValue.startsWith(ContextValues.projectFolder) ? item.path : null);
            if (Promise.resolve(result) === result) {
                result = await (<Promise<any>>result);
            }

            return result;
        }

        return {};
    }

	private async copyFolder(src: string, dest: string): Promise<void> {
		var exists = await fs.exists(src);
		var isDirectory = exists && await fs.isDirectory(src);
		if (exists && isDirectory) {
            if (!(await fs.exists(dest))) {
                await fs.mkdir(dest);
            }

			let items = await fs.readdir(src);
			for(let i = 0; i < items.length; i++) {
				let childItemName = items[i];
				await this.copyFolder(path.join(src, childItemName), path.join(dest, childItemName));
			}
		} else {
			await fs.copy(src, dest);
		}
	}
}
