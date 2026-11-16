import { ReferenceType } from "../ReferenceType";
import { ProjectItem } from "./ProjectItem";

export class Reference extends ProjectItem {
    constructor(public readonly name: string, public readonly version: string | undefined, public readonly hintPath : string | undefined) {
        super(ReferenceType[ReferenceType.Reference]);
    }
}
