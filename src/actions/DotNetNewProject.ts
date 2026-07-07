import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetCreateProject extends CustomTerminalAction {
    constructor(projectType: string, language: string, private readonly projectName: string, folderName: string, workingFolder: string, framework?: string) {
        super({
            name: "createProject",
            parameters: { projectType, language, projectName, folderName, framework: framework ?? "" },
            workingFolder
        });
    }

    public toString(): string {
        return `Create project ${this.projectName}`;
    }
}