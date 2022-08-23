import { DotnetAction } from "./base/DotnetAction";

export class CreateProject extends DotnetAction {
    constructor(projectType: string, language: string, projectName: string, folderName: string, workingFolder: string) {
        super(["new", projectType, "-lang", language, "-n", projectName, "-o", folderName], workingFolder);
    }
}