import * as fs from "fs";
import * as xml2js from "xml2js";

export function ParseToJson(content: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        let parser = new xml2js.Parser();
        parser.parseString(content, function (err, result) {
            if (err)
                reject(err);

            resolve(result);
        });
    });
}

export function ParseToXml(content: any): Promise<string> {
    let builder = new xml2js.Builder();
    return Promise.resolve(builder.buildObject(content));
}