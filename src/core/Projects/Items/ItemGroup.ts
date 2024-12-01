import { XmlElement } from "@extensions/xml";
import { PackageReference } from "./PackageReference";
import { ProjectItem } from "./ProjectItem";
import { PackageVersion } from "./PackageVersion";

export class ItemGroup extends ProjectItem {
  constructor(
    public name: string,
    public condition: string | undefined,
    public label: string | undefined,
    public packageReferences: PackageReference[] = [],
    public packageVersions: PackageVersion[] = []

  ) {
    super("ItemGroup");
  }

  public hasElements(): boolean {
    return this.packageReferences.length > 0 || this.packageVersions.length > 0;
  }
  public toElement(): XmlElement {
    const itemGroup: XmlElement = {
      type: "element",
      name: "ItemGroup",
      attributes: {},
    };

    if (this.condition) {
      itemGroup.attributes.Condition = this.condition;
    }

    if (this.label) {
      itemGroup.attributes.Label = this.label;
    }

    itemGroup.elements = [
      ...this.packageVersions.map((pv) => pv.toElement()),
      ...this.packageReferences.map((pr) => pr.toElement())
    ];

    return itemGroup;
  }
}
