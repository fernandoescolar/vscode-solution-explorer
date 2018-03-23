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
        if (ref.DependentUpon && ref.DependentUpon[0].startsWith(pattern)) {
            ref.DependentUpon[0] = ref.DependentUpon[0].replace(pattern, newPattern);
        }
    }

    protected deleteDependsUponNode(node: any, pattern: string) {
        if (node.DependentUpon && node.DependentUpon[0].startsWith(pattern)) {
            delete node.DependentUpon;
        }
    }
}