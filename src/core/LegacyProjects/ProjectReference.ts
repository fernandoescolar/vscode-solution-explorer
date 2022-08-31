import * as path from "@extensions/path";

export class ProjectReference {
    public readonly name: string

    constructor(public readonly filepath: string) {
        let ref = filepath.replace(/\\/g, path.sep).trim();
        ref = ref.split(path.sep).pop() || "";
        const extension = ref.split('.').pop() || "";
        this.name = ref.substring(0, ref.length - extension.length - 1);
    }
}