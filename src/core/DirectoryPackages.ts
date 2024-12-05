import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as xml from "@extensions/xml";
import { ItemGroup, PackageReference, PackageVersion, PropertyGroup } from "./Projects/Items";
import { XmlElement } from "@extensions/xml";
import { XmlManager } from "./Projects/Managers";
import { Solution, SolutionProject } from "./Solutions";

export const DIRECTORY_PACKAGES_FILE_NAME = "Directory.Packages.props";
export class DirectoryPackages {
  private _itemGroups: Record<string, ItemGroup>;
  private _propertyGroups: PropertyGroup[];
  private _xml: XmlManager;
  private _pathToFolder: string;
  private static _generating: boolean = false;

  private _fullPath(): string {
    return path.join(this._pathToFolder, DIRECTORY_PACKAGES_FILE_NAME);
  }

  constructor(pathToFolder: string) {
    this._propertyGroups = [
      new PropertyGroup({
        ManagePackageVersionsCentrally: "true",
      }),
    ];
    this._itemGroups = {};
    this._pathToFolder = pathToFolder;
    this._xml = new XmlManager(this._fullPath());
  }
  private getItemGroupKeyFromLabelAndCondition(
    label: string | undefined,
    condition: string | undefined
  ): string {
    return `${label}|${condition}`;
  }
  private getItemGroupKey(itemGroup: ItemGroup): string {
    return this.getItemGroupKeyFromLabelAndCondition(
      itemGroup.label,
      itemGroup.condition
    );
  }
  public addItemGroup(itemGroup: ItemGroup) {
    const key = this.getItemGroupKey(itemGroup);
    if (!itemGroup.hasElements()) return;

    if (!this._itemGroups[key]) {
      this._itemGroups[key] = new ItemGroup(
        itemGroup.name,
        itemGroup.condition,
        itemGroup.label
      );
    }

    itemGroup.packageReferences
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((p) => {
        const pv = PackageVersion.fromPackageReference(p);
        if (pv && !this.hasPackageVersionName(pv.name, itemGroup.condition) && this._itemGroups[key].condition===itemGroup.condition)
          this._itemGroups[key].packageVersions.push(pv);
      });

    itemGroup.packageVersions.forEach((p) => {
      this._itemGroups[key].packageVersions.push(p);
    });

    if (!this._itemGroups[key].hasElements()) delete this._itemGroups[key];
    this._itemGroups[key].packageVersions =
      this._itemGroups[key].packageVersions.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      )
  }

  public removeItemGroup(
    condition: string | undefined,
    label: string | undefined
  ) {
    const key = this.getItemGroupKeyFromLabelAndCondition(label, condition);
    if (this._itemGroups[key]) {
      delete this._itemGroups[key];
    }
  }

  public hasPackageVersionName(
    name: string,
    condition: string | undefined
  ): boolean {
    return (
      Object.values(this._itemGroups).filter(
        (i) =>
          i.condition === condition &&
          i.packageVersions.filter((pv) => pv.name.toLocaleLowerCase() === name.toLocaleLowerCase()).length > 0
      )?.length > 0
    );
  }

  public async save(): Promise<void> {
    const content = await xml.parseToXml({
      type: "element",
      name: "root",
      elements: [this.toElement()],
    });

    await fs.writeFile(path.join(this._fullPath()), content);
  }

  public async load(): Promise<void> {
    if (!(await fs.exists(this._fullPath()))) {
      const content = await xml.parseToXml({
        type: "element",
        name: "root",
        elements: [this.toElement()],
      });
      await fs.writeFile(this._fullPath(), content);
    } else {
      (await this._xml.getItemGroups()).forEach((ig) => this.addItemGroup(ig));
      this._propertyGroups = await this._xml.getPropertyGroups();
    }
  }

  public static async existsInPath(folderPath: string): Promise<boolean> {
    return await fs.exists(path.join(folderPath, DIRECTORY_PACKAGES_FILE_NAME));
  }

  public async addProjectFile(projectFilePath: string): Promise<void> {
    if (!(await fs.exists(projectFilePath))) return;
    const xmlProject = new XmlManager(projectFilePath);
    const projectItemGroups = await xmlProject.getItemGroups();
    projectItemGroups.forEach((ig) => {
      this.addItemGroup(ig);
    });
    await this.save();
    await xmlProject.deletePackageReferencesVersion();
  }

  public async addProject(projectItem: SolutionProject): Promise<void> {
    if (!projectItem || !projectItem.fullPath) return;
    await this.addProjectFile(projectItem.fullPath);
    return;
  }

  public static isRunning(): boolean {
    return this._generating;
  }

  public async addProjects(projectItems: SolutionProject[]): Promise<void> {
    if (!projectItems) return;
    if (DirectoryPackages._generating) return;
    DirectoryPackages._generating = true;
    for (const p of projectItems) {
      await this.addProject(p);
    }
    
    DirectoryPackages._generating = false;
  }

  public toElement(): XmlElement {
    return {
      type: "element",
      name: "Project",
      elements: [
        ...this._propertyGroups.map((pg) => {
          return pg.toElement();
        }),
        ...Object.values(this._itemGroups).map((ig) => {
          return ig.toElement();
        }),
      ],
    };
  }
}
