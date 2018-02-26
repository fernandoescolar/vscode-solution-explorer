import * as Handlebars from "handlebars";
import * as path from "path";
import * as fs from "../async/fs";
import { ITemplate } from "./ITemplate";
import { TreeItem, ContextValues } from "../tree";

const TemplateFilename: string = "template-list.json";

export class TemplateEngine {
    
    private templates: ITemplate[];

    constructor(private readonly workingFolder: string) {
    }

    public async getTemplates(extension: string): Promise<string[]> {
        if (!this.templates) {
            let filepath = path.join(this.workingFolder, TemplateFilename);
            if (!(await fs.exists(filepath))) return [];
            
            let content = await fs.readFile(filepath, "utf8");
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

    public getParameters(template: ITemplate, filename: string, item: TreeItem): {[id: string]: string} {
        let parametersGetter = require(path.join(this.workingFolder, template.parameters));
        if (parametersGetter) {
            return parametersGetter(filename, item.project ? item.project.fullPath : null, item.contextValue.startsWith(ContextValues.ProjectFolder) ? item.path : null);
        }

        return null;
    }

    public async generate(filename: string, templateName: string, item: TreeItem): Promise<string> {
        let extension = path.extname(filename).substring(1);
        let index = this.templates.findIndex(t => t.extension.toLocaleLowerCase() == extension.toLocaleLowerCase() && t.name == templateName);
        if (index < 0) return;

        let template = this.templates[index];
        let content = await fs.readFile(path.join(this.workingFolder, template.file), "utf8");
        let handlebar = Handlebars.compile(content);
        let result = handlebar(this.getParameters(template, filename, item));
        return result;
    }
}