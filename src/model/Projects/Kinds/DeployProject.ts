import { StandardProject } from "./StandardProject";
import { ProjectInSolution } from "../../Solutions/ProjectInSolution";
import { ProjectFile } from "../ProjectFile";
import { ProjectFolder } from "../ProjectFolder";

export class DeployProject extends StandardProject {
    constructor(projectInSolution: ProjectInSolution) {
        super(projectInSolution, null , 'deploy');
    }

    public async getProjectFilesAndFolders(virtualPath?: string): Promise<{ files: ProjectFile[]; folders: ProjectFolder[]; }> {
        let result = await super.getProjectFilesAndFolders(virtualPath);
        let index = result.files.findIndex(f => f.name.toLocaleLowerCase() === 'deployment.targets');
        if (index >= 0) {
            result.files.splice(index, 1);
        }

        return result;
    }
}