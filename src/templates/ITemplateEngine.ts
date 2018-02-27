import { TreeItem } from "../tree";

export interface ITemplateEngine {
    getTemplates(extension: string): Promise<string[]>;
    generate(filename: string, templateName: string, item: TreeItem): Promise<string>;
    existsTemplates(): Promise<boolean>;
    creteTemplates(): Promise<void>;
}