import { ProjectItem } from "./ProjectItem";

export class Reference extends ProjectItem {
    constructor(public readonly name: string, public readonly version: string | undefined) {
        super("Reference");
    }
}
