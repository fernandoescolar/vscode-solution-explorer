import { Solution } from "@core/Solutions";
import { Action, ActionContext } from "./base/Action";
import { DirectoryPackages } from "@core/DirectoryPackages";

export class CreateDirectoryPackages implements Action {
  constructor(private readonly solution: Solution) { }

  public toString(): string {
    return `Create Directory.Packages.props in solution ${this.solution.name}`;
  }

  public async execute(context: ActionContext): Promise<void> {
    const projects = this.solution.getAllProjects();
    const directoryPackage = new DirectoryPackages(this.solution.folderPath);
    await directoryPackage.load();
    directoryPackage.addProjects(projects);
  }
}
