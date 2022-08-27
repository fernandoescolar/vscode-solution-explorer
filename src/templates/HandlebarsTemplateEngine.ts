import * as Handlebars from "handlebars";
import { TemplateEngine } from "./TemplateEngine";

export class HandlebarsTemplateEngine extends TemplateEngine {
    constructor(templateFile: string) {
        super(templateFile);
    }

    protected formatContent(content: string, parameters: { [id: string]: string; }): Promise<string> {
        const handlebar = Handlebars.compile(content);
        const result = handlebar(parameters);
        return Promise.resolve(result);
    }
}
