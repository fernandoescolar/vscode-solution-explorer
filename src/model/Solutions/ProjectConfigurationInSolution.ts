/***********
 * TypeScript simplified version of: 
 * https://github.com/Microsoft/msbuild/blob/master/src/Build/Construction/Solution/ProjectConfigurationInSolution.cs
 */

export class ProjectConfigurationInSolution {
    constructor(private readonly configurationName: string, private readonly platformName: string, private readonly includeInBuild: boolean) {
    }

    public get ConfigurationName(): string {
        return this.configurationName;
    }

    public get PlatformName(): string {
        return this.platformName;
    }

    public get IncludeInBuild(): boolean {
        return this.includeInBuild;
    }

    public get FullName(): string {
        return this.ComputeFullName();
    }

    private ComputeFullName(): string  {
        // Some configurations don't have the platform part
        if (this.PlatformName && this.PlatformName.length > 0) {
            return this.ConfigurationName + '|' + this.PlatformName;
        }
        else {
            return this.ConfigurationName;
        }
    }
}