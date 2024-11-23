/***********
 * TypeScript simplified version of: 
 * https://github.com/Microsoft/msbuild/blob/master/src/Build/Construction/Solution/ProjectConfigurationInSolution.cs
 */

export class ProjectConfigurationInSolution {
    constructor(public readonly configurationName: string, public readonly platformName: string, public readonly includeInBuild: boolean) {
    }

    public get fullName(): string {
        return this.computeFullName();
    }

    private computeFullName(): string  {
        // Some configurations don't have the platform part
        if (this.platformName && this.platformName.length > 0) {
            return this.configurationName + '|' + this.platformName;
        }
        else {
            return this.configurationName;
        }
    }
}