import { XmlElement } from "@extensions/xml";
import { ProjectItem } from "./ProjectItem";
import { PackageReference } from "./PackageReference";

export class PackageVersion extends ProjectItem {
    constructor(public readonly name: string, public version: string) {
        super("PackageVersion");
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
            name: "PackageVersion",
            attributes: {
                Include: this.name,
                Version: this.version,
            },
        };
    }

    public static fromPackageReference(packageReference: PackageReference): PackageVersion | undefined {
        if (!packageReference || !packageReference.hasVersion())
            return undefined;
        return new PackageVersion(packageReference.name, packageReference.version);

    }
}
