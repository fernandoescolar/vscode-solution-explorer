import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as xml from "@extensions/xml";
import { TreeItem, ContextValues } from "@tree";
import { ITemplate } from "./ITemplate";
import { Project } from "@core/Projects";
import { XmlManager } from "@core/Projects/Managers";

export abstract class TemplateEngine {
    private templates: ITemplate[] | undefined;

    constructor(private readonly templateFile: string) {
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

        const extension = path.extname(filename).substring(1);
        const index = this.templates.findIndex(t => t.extension.toLocaleLowerCase() === extension.toLocaleLowerCase() && t.name === templateName);
        if (index < 0) { return; }

        const template = this.templates[index];
        const workingFolder = path.dirname(this.templateFile);
        const content = await fs.readFile(path.join(workingFolder, template.file));
        const parameters = await this.getParameters(template, filename, item);

        return await this.formatContent(content, parameters);
    }

    protected abstract formatContent(content: string, parameters: {[id: string]: string}): Promise<string>;

    private async getParameters(template: ITemplate, filename: string, item: TreeItem): Promise<{[id: string]: string}> {
        if (!item || !item.project) { return {}; }

        const workingFolder = path.dirname(this.templateFile);
        const filepath = path.join(workingFolder, template.parameters).replace(/\\/g, '\\\\');
        const parametersGetter = eval(`require('${filepath}')`);
        const content = await fs.readFile(item.project.fullPath);
        const xmlContent =  await xml.parseToJson(content);
        const projectXml = XmlManager.getProjectElement(xmlContent) || { elements: [] };
        if (parametersGetter) {
            let result = parametersGetter(filename, item.project.fullPath, ContextValues.matchAnyLanguage(ContextValues.projectFolder, item.contextValue) ? item.path : undefined, projectXml);
            if (Promise.resolve(result) === result) {
                result = await (<Promise<any>>result);
            }

            return result;
        }

        return {};
    }
}
