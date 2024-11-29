import { ProjectItem } from "./ProjectItem";

export class PackageReference extends ProjectItem {
  constructor(public readonly name: string, public version: string) {
    super("PackageReference");
  }

  public UpdateVersion(newVersion: string): void {
    this.version = newVersion;
  }
}
