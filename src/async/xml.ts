import * as convert from "xml-js";
import * as config from "../SolutionExplorerConfiguration";

const readOptions: convert.Options.XML2JSON = {
    compact: false
};

const writeOptions: convert.Options.JS2XML = {
    compact: false,
    spaces: 2
};

export function ParseToJson(content: string): Promise<any> {
    let result = <any>convert.xml2js(content, readOptions);
    if (result.declaration) {
        delete result.declaration
    }
    return Promise.resolve(result);    
}

export function ParseToXml(content: any): Promise<string> {
    writeOptions.spaces = config.getXmlSpaces();
    let result = convert.js2xml(content, writeOptions);
    if (config.getXmlClosingTagSpace()) {
        let re = /([A-Za-z0-9_\"]+)\/\>/g;
        result = result.replace(re,"$1 />");
    }
    return Promise.resolve(result);
}