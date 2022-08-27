import * as path from "@extensions/path";
import { ProjectInSolution } from "../../Solutions";
import { PackageReference } from "../PackageReference";
import { ProjectReference } from "../ProjectReference";
import { StandardProject, TreePart } from "./StandardProject";
import { ProjectFile } from "..";
import { XmlElement } from "@extensions/xml";

export class SharedProject extends StandardProject {
    constructor(projectInSolution: ProjectInSolution) {
        super(projectInSolution, undefined , 'shared');
        this.setHasReferences(false);
        this.includePrefix = "$(MSBuildThisFileDirectory)";
    }

    public get fullPath(): string {
        return this.projectInSolution.fullPath.replace(".shproj", ".projitems");
    }

    public getProjectReferences(): Promise<ProjectReference[]> {
        return Promise.resolve([]);
    }

    public getPackageReferences(): Promise<PackageReference[]> {
        return Promise.resolve([]);
    }

    protected addFileDependents(item: TreePart, projectFile: ProjectFile): void {
        let key = path.basename(item.virtualpath);
        if (this.dependents[key]) {
            projectFile.hasDependents = true;
            this.dependents[key].forEach(d => {
                let dependentFullPath = path.join(path.dirname(this.fullPath), d);
                projectFile.dependents.push(new ProjectFile(dependentFullPath));
            });
        }
    }

    protected replaceDependsUponNode(ref: XmlElement, pattern: string, newPattern: string): void {
        ref.elements.forEach((e: XmlElement) => {
            if (e.name === 'DependentUpon' && e.elements[0].text.startsWith(pattern)) {
                e.elements[0].text = e.elements[0].text.replace(pattern, newPattern);
            }
        });
    }

    protected deleteDependsUponNode(node: XmlElement, pattern: string): void {
        if (!node.elements) { return; }

        node.elements.forEach((e: XmlElement, eIndex: number) => {
            if (e.name === 'DependentUpon' && e.elements[0].text.startsWith(pattern)) {
                node.elements.splice(eIndex, 1);
            }
        });

        if (node.elements.length === 0) {
            delete node.elements;
        }
    }
}