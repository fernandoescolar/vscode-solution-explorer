import { FileSystemBasedProject } from "./FileSystemBasedProject";
import { ProjectInSolution } from "../Solutions";
import { PackageReference } from "./PackageReference";

export class WebProject extends FileSystemBasedProject {
    constructor(projectInSolution: ProjectInSolution) {
        super(projectInSolution);
        this.setHasReferences(false);
    }

    public getProjectReferences(): Promise<string[]> {
        return Promise.resolve(null);
    }

    public getPackageReferences(): Promise<PackageReference[]> {
        return Promise.resolve(null);
    }
}