import * as fs from "fs";
import * as convert from "xml-js";

const options: convert.Options.JS2XML = {
    compact: false,
    spaces: 2
}

export function ParseToJson(content: string): Promise<any> {
    let result = <any>convert.xml2js(content, options);
    if (result.declaration) {
        delete result.declaration
    }
    return Promise.resolve(result);    
}

export function ParseToXml(content: any): Promise<string> {
    let result = convert.js2xml(content, options);
    return Promise.resolve(result);
}