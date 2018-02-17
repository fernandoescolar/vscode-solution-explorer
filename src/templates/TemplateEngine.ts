import * as Handlebars from "handlebars";

export class TemplateEngine {
    public generate(): string {
        let template = Handlebars.compile("");
        let result = template({});
        return result;
    }
}