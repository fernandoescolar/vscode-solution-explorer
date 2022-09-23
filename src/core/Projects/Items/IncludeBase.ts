import * as path from "@extensions/path";
import { ProjectItem } from "./ProjectItem";

export abstract class IncludeBase extends ProjectItem {
    public readonly value: string;
    public readonly link: string;
    public readonly linkBase: string;

    constructor(type: string, value: string, link?: string, linkBase?: string) {
        super(type);
        this.value = value;
        this.link = link || "%(LinkBase)" + path.sep + "%(RecursiveDir)%(Filename)%(Extension)";
        this.linkBase = linkBase || "";
    }

    protected getRelativePath(filepath: string, recursiveDir: string): string {
        const extension = path.extname(filepath);
        const filename = path.basename(filepath, extension);
        const result = this.link
                            .replace("%(Extension)", extension)
                            .replace("%(Filename)", filename)
                            .replace("%(RecursiveDir)", recursiveDir)
                            .replace("%(LinkBase)", this.linkBase);

        if (result.startsWith(path.sep)) {
            return result.substring(1);
        }

        return result;
    }

    protected getRecursiveDir(filepath: string, searchPath: string): string {
        let result = path.dirname(filepath).substring(searchPath.length + 1);
        if (result) {
            if (result.startsWith(path.sep)) {
                result = result.substring(1);
            }
            if (!result.endsWith(path.sep)) {
                result += path.sep;
            }
        }

        return result;
    }
}
