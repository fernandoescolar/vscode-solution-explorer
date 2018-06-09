import * as path from "path";
import { ProjectInSolution } from "../../Solutions";
import { PackageReference } from "../PackageReference";
import { ProjectReference } from "../ProjectReference";
import { StandardProject } from "./StandardProject";
import { ProjectFile } from "..";

const projectFileName: string = "";

export class SharedProject extends StandardProject {
    constructor(projectInSolution: ProjectInSolution) {
        super(projectInSolution, null , 'shared');
        this.setHasReferences(false);
        this.includePrefix = "$(MSBuildThisFileDirectory)";
    }

    public get fullPath(): string {
        return this.projectInSolution.fullPath.replace(".shproj", ".projitems");        
    }

    public getProjectReferences(): Promise<ProjectReference[]> {
        return Promise.resolve(null);
    }

    public getPackageReferences(): Promise<PackageReference[]> {
        return Promise.resolve(null);
    }

    protected addFileDependents(item: any, projectFile: ProjectFile) {
        let key = path.basename(item.virtualpath);
        if (this.dependents[key]) {
            projectFile.hasDependents = true;
            this.dependents[key].forEach(d => {
                let dependentFullPath = path.join(path.dirname(this.fullPath), d);
                projectFile.dependents.push(new ProjectFile(dependentFullPath));
            });
        }
    }

    protected replaceDependsUponNode(ref: any, pattern: string, newPattern: string) {
        ref.elements.forEach(e => {
            if (e.name === 'DependentUpon' && e.elements[0].text.startsWith(pattern)) {
                e.elements[0].text = e.elements[0].text.replace(pattern, newPattern);
            }
        });
    }

    protected deleteDependsUponNode(node: any, pattern: string) {
        if (!node.elements) return;

        node.elements.forEach((e, eIndex) => {
            if (e.name === 'DependentUpon' && e.elements[0].text.startsWith(pattern)) {
                node.elements.splice(eIndex, 1);
            }
        });

        if (node.elements.length === 0) {
            delete node.elements;
        }
    }
}