import { XmlElement } from "@extensions/xml";
import { ProjectItem } from "./ProjectItem";

export class PackageReference extends ProjectItem {
  constructor(public readonly name: string, public version: string) {
    super("PackageReference");
  }

  public hasVersion(): boolean {
    return !!this.version;
  }

  public updateVersion(newVersion: string): void {
    this.version = newVersion;
  }

  public toElement(): XmlElement {
    return {
      type: "element",
      name: "PackageReference",
      attributes: {
        Include: this.name,
        Version: this.version,
      },
    };
  }

  
}
