/***********
 * TypeScript simplified version of: 
 * https://github.com/Microsoft/msbuild/blob/master/src/Build/Construction/Solution/SolutionConfigurationInSolution.cs
 */

export class SolutionConfigurationInSolution {
    constructor(private readonly configurationName: string, private readonly platformName: string) {
    }

    public get ConfigurationName(): string {
        return this.configurationName; 
    }

    public get PlatformName(): string {
        return this.platformName;
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