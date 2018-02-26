import * as Handlebars from "handlebars";
import * as path from "path";
import * as fs from "../async/fs";
import { ITemplate } from "./ITemplate";

const TemplateFilename: string = "template-list.json";

export class TemplateEngine {
    
    private templates: ITemplate[];

    constructor(private readonly workingFolder: string) {
    }

    public async getTemplates(extension: string): Promise<string[]> {
        if (!this.templates) {
            let filepath = path.join(this.workingFolder, TemplateFilename);
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

    public async generate(extension: string, templateName: string, parameters: {[id: string]: string}): Promise<string> {
        let index = this.templates.findIndex(t => t.extension.toLocaleLowerCase() == extension.toLocaleLowerCase() && t.name == templateName);
        if (index < 0) return;

        let template = this.templates[index];
        let content = await fs.readFile(path.join(this.workingFolder, template.file), "utf8");
        let handlebar = Handlebars.compile(content);
        let result = handlebar(parameters);
        return result;
    }
}