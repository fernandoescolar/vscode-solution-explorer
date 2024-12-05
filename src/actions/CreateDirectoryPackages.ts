import { Solution } from "@core/Solutions";
import { Action, ActionContext } from "./base/Action";
import { DirectoryPackages } from "@core/DirectoryPackages";
import * as vscode from "vscode";
import * as fs from "@extensions/fs";

export class CreateDirectoryPackages implements Action {
  constructor(private readonly solution: Solution) {}

  public toString(): string {
    return `Create Directory.Packages.props in solution ${this.solution.name}`;
  }

  private async getDirectoryBuildFiles(): Promise<string[]> {
    return vscode.workspace
      .findFiles("**/Directory.Build.props")
      .then((directoryFiles) => {
        if (directoryFiles.length == 0) return [];
        return directoryFiles.map((file) => file.fsPath);
      });
  }
  public async execute(context: ActionContext): Promise<void> {
    const projects = this.solution.getAllProjects();
    const directoryBuildsFiles = await this.getDirectoryBuildFiles();
    const directoryPackage = new DirectoryPackages(this.solution.folderPath);
    await directoryPackage.load();

    await directoryPackage.addProjects(projects);

    for (var db in directoryBuildsFiles) {
      await await directoryPackage.addProjectFile(directoryBuildsFiles[db]);
    }
  }
}
