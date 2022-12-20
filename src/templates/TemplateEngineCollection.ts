import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { TemplateEngine } from "./TemplateEngine";
import { HandlebarsTemplateEngine } from "./HandlebarsTemplateEngine";

const TEMPLATE_FOLDER_NAME: string = "solution-explorer";
const VSCODE_FOLDER_NAME: string = ".vscode";
const TEMPLATE_FILE_NAME: string = "template-list.json";
const SOURCE_FOLDER: string = path.join(__dirname, "..", "files-vscode-folder");
const DEFAULT_TEMPLATE_FILE: string = path.join(SOURCE_FOLDER, TEMPLATE_FILE_NAME);

export class TemplateEngineCollection {
    private static readonly defaultTemplateEngine: TemplateEngine = new HandlebarsTemplateEngine(DEFAULT_TEMPLATE_FILE);
    private templateEngines: { [id: string]: TemplateEngine } = {};

    public async createTemplateEngine(workspaceRoot: string): Promise<TemplateEngine> {
       this.templateEngines[workspaceRoot] = await this.getOrCreateTemplateEngine(workspaceRoot);
       return this.templateEngines[workspaceRoot];
    }

    public getTemplateEngine(workspaceRoot: string): TemplateEngine {
		return this.templateEngines[workspaceRoot];
	}

    public reset() {
        this.templateEngines = {};
	}

    public exists(workspaceRoot: string): Promise<boolean> {
        const templateFile = path.join(workspaceRoot, VSCODE_FOLDER_NAME, TEMPLATE_FOLDER_NAME, TEMPLATE_FILE_NAME);
        return fs.exists(templateFile);
    }

    public async installTemplates(workspaceRoot: string): Promise<void> {
        const vscodeFolder = path.join(workspaceRoot, VSCODE_FOLDER_NAME);
        if (!(await fs.exists(vscodeFolder))) {
            await fs.mkdir(vscodeFolder);
        }

        const workingFolder = path.join(workspaceRoot, VSCODE_FOLDER_NAME, TEMPLATE_FOLDER_NAME);
        await this.copyFolder(SOURCE_FOLDER, workingFolder);
    }

    private async getOrCreateTemplateEngine(workspaceRoot: string): Promise<TemplateEngine> {
        const templateFile = path.join(workspaceRoot, VSCODE_FOLDER_NAME, TEMPLATE_FOLDER_NAME, TEMPLATE_FILE_NAME);
        if (await fs.exists(templateFile)) {
            return new HandlebarsTemplateEngine(templateFile);
        } else {
            return TemplateEngineCollection.defaultTemplateEngine;
        }
    }

    private async copyFolder(src: string, dest: string): Promise<void> {
        const exists = await fs.exists(src);
        const isDirectory = exists && await fs.isDirectory(src);
        if (exists && isDirectory) {
            if (!(await fs.exists(dest))) {
                await fs.mkdir(dest);
            }

            let items = await fs.readdir(src);
            for (let i = 0; i < items.length; i++) {
                let childItemName = items[i];
                await this.copyFolder(path.join(src, childItemName), path.join(dest, childItemName));
            }
        } else {
            await fs.copy(src, dest);
        }
    }
}
