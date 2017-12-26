import PackageInfo from './PackageInfo'

export default class ProjectInfo {
    constructor(public readonly path: string){
        this.references = [];
        this.packages = [];
    }

    public references: string[];

    public packages: PackageInfo[];
}