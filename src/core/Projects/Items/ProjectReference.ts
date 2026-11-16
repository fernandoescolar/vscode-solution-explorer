import { ReferenceType } from "../ReferenceType";
import { ProjectItem } from "./ProjectItem";

export class ProjectReference extends ProjectItem {
    constructor(public readonly name: string, public readonly relativePath: string) {
        super(ReferenceType[ReferenceType.ProjectReference]);
    }
}
