import { ProjectInSolution } from "../../Solutions";
import { PackageReference } from "../PackageReference";
import { ProjectReference } from "../ProjectReference";
import { FileSystemBasedProject } from "./FileSystemBasedProject";

export class WebsiteProject extends FileSystemBasedProject {
    constructor(projectInSolution: ProjectInSolution) {
        super(projectInSolution, 'website');
        this.setHasReferences(false);
    }

    public refresh(): Promise<void> {
        return Promise.resolve();
    }

    public getProjectReferences(): Promise<ProjectReference[]> {
        return Promise.resolve(null);
    }

    public getPackageReferences(): Promise<PackageReference[]> {
        return Promise.resolve(null);
    }
}