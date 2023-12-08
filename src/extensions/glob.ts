import * as fs from "@extensions/fs";
import * as path from "@extensions/path";

export function globMatch(pattern: string, input: string): RegExpMatchArray | null {
    if (!isGlobPattern(pattern)) {
        return input.match(pattern);
    }

    const regExp = toRegExp(pattern);
    return regExp.exec(input);
}

export function globTest(pattern: string | string[], input: string): boolean {
    if (typeof pattern === "string") {
        pattern = [ pattern ];
    }
    for (const p of pattern) {
        if (isGlobPattern(p)) {
            if (toRegExp(p).exec(input)) {
                return true;
            }
        } else if (input.endsWith(p)) {
            return true;
        }
    }

   return false;
}

export async function globFileSearch(workingFolder: string, pattern: string, exclude?:string | string[]): Promise<string[]> {
    const result: string[] = [];
    if (! await fs.exists(workingFolder)) {
        return result;
    }

    if (! await fs.isDirectory(workingFolder)) {
        return result;
    }

    if (!isGlobPattern(pattern)) {
        return [ path.join(workingFolder, pattern) ];
    }

    const files = await fs.readdir(workingFolder);
    for (let i = 0; i < files.length; i++) {
        const filename = path.join(workingFolder, files[i]);
        if (exclude && globTest(exclude, filename)) {
            continue;
        }

        if (globTest(pattern, filename)) {
            result.push(filename);
        }

        const isDirectory = await fs.isDirectory(filename);
        if (isDirectory) {
            const subresult = await globFileSearch(filename, pattern, exclude);
            result.push(...subresult);
        }
    }

    return result;
}

export function isGlobPattern(pattern: string): boolean {
    return pattern.indexOf("*") >= 0
        || pattern.indexOf("?") >= 0
        || pattern.indexOf("[") >= 0
        || pattern.indexOf("{") >= 0;
}

function toRegExp(globPattern: string): RegExp {
    let regExpString = "", isRange = false, isBlock = false;
    for(let i = 0; i < globPattern.length; i++) {
        const c = globPattern[i];
        if ([".", "/", "\\", "$", "^"].indexOf(c) !== -1) {
            regExpString += "\\" + c;
        } else if (c === "?") {
            regExpString += ".";
        } else if (c === "[") {
            isRange = true;
            regExpString += "[";
        } else if (c === "]") {
            isRange = false;
            regExpString += "]";
        } else if (c === "!") {
            if (isRange) {
                regExpString += "^";
            } else {
                regExpString += "!";
            }
        } else if (c === "{") {
            isBlock = true;
            regExpString += "(";
        } else if (c === "}") {
            isBlock = false;
            regExpString += ")";
        } else if (c === ",") {
            if (isBlock) {
                regExpString += "|";
            } else {
                regExpString += "\\,";
            }
        } else if (c === "*") {
            let nextChar = globPattern[i + 1];
            if (nextChar === "*") {
                regExpString += ".*";
                i++;
                nextChar = globPattern[i + 1];
                if (nextChar === "/" || nextChar === "\\") {
                    i++;
                }
            } else {
                regExpString += "[^/]*";
            }
        } else {
            regExpString += c;
        }
    }
    return new RegExp(regExpString);
}
