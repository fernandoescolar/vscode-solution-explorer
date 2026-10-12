import * as path from "@extensions/path"
import { TreeItem } from "@tree";
import {
  Action,
  CreateDirectoryPackages,
  SlnAddSolutionFile,
  SlnCreateSolutionFolder,
  SlnxAddSolutionFile,
  SlnxCreateSolutionFolder,
} from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { SolutionFolder, SolutionType } from "@core/Solutions";
import { DIRECTORY_PACKAGES_FILE_NAME } from "@core/DirectoryPackages";
import { SolutionTreeItem } from "@tree/items/SolutionTreeItem";

export class CreateDirectoryPackagesCommand extends SingleItemActionsCommand {
  constructor() {
    super("Create Directory.Packages.props");
  }

  public shouldRun(item: SolutionTreeItem | undefined): boolean {
    return !!item && !!item.workspaceRoot;
  }

  public async getActions(item: SolutionTreeItem | undefined): Promise<Action[]> {
    if (
      !item ||
      !item.solution ||
      !item.solution.fullPath
    ) {
      return [];
    }

    const solution = item.solution;
    const folderName = "Solution items";
    const filePath = path.join(solution.folderPath, DIRECTORY_PACKAGES_FILE_NAME);
    const existingFolder = solution.getFolders().find((f) => f.name === folderName);

    if (solution.type === SolutionType.Sln) {
      const actions: Action[] = [];
      if (!existingFolder) {
        actions.push(new SlnCreateSolutionFolder(solution, folderName, item.solutionItem));
      }

      actions.push(new CreateDirectoryPackages(solution));
      actions.push(new SlnAddSolutionFile(solution, new SolutionFolder(folderName), filePath));
      return actions;
    }

    if (solution.type === SolutionType.Slnx) {
      const actions: Action[] = [];
      if (!existingFolder) {
        actions.push(new SlnxCreateSolutionFolder(solution, folderName));
      }

      // the slnx editor locates the target <Folder> element by name
      const folder = existingFolder ?? new SolutionFolder(folderName);
      folder.name = folderName;

      actions.push(new CreateDirectoryPackages(solution));
      actions.push(new SlnxAddSolutionFile(solution, folder, filePath));
      return actions;
    }

    return [];
  }
}
