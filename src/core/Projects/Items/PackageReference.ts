import { ProjectItem } from "./ProjectItem";

export class PackageReference extends ProjectItem {
    constructor(public readonly name: string, public readonly version: string) {
        super("PackageReference");
    }
}
