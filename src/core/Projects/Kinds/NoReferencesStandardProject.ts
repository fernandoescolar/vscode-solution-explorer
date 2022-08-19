import { StandardProject } from "./StandardProject";
import { ProjectInSolution } from "../../Solutions";

export class NoReferencesStandardProject extends StandardProject {
    constructor(projectInSolution: ProjectInSolution, document?: any, type?: string) {
        super(projectInSolution, document, type ? type : 'standard');
        this.setHasReferences(false);
    }
}