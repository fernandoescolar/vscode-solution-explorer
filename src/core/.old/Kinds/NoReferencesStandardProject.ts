import { StandardProject } from "./StandardProject";
import { ProjectInSolution } from "../../Solutions";
import { XmlElement } from "@extensions/xml";

export class NoReferencesStandardProject extends StandardProject {
    constructor(projectInSolution: ProjectInSolution, document?: XmlElement, type?: string) {
        super(projectInSolution, document, type ? type : 'standard');
        this.setHasReferences(false);
    }
}