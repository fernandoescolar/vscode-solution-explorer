import * as path from "@extensions/path"
import { TreeItem } from "@tree";
import {
  Action,
  CreateDirectoryPackages,
  SlnAddSolutionFile,
  SlnCreateSolutionFolder,
} from "@actions";
import {
  AddExistingFileToSolutionFolderCommand,
  SingleItemActionsCommand,
} from "@commands";
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
      item.solution.type != SolutionType.Sln ||
      !item.solution.fullPath
    ) {
      return [];
    }

    let actions = [];

    if (
      item.solution.getFolders().filter((f) => f.name === "Solution items")
        .length == 0
    ) {
      actions.push(
        new SlnCreateSolutionFolder(
          item.solution,
          "Solution items",
          item.solutionItem
        )
      );
    }

    actions.push(new CreateDirectoryPackages(item.solution));
    actions.push(new SlnAddSolutionFile(item.solution, new SolutionFolder("Solution items"), path.join(item.solution.folderPath, DIRECTORY_PACKAGES_FILE_NAME)));

    if (item.solution.type === SolutionType.Sln) {
      return actions;
    }

    return [];
  }
}
