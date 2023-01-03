import { Project } from "./Project";
import { getNugetDependencies, NugetDependencies } from "@extensions/nuget-dependencies";

export abstract class ProjectWithNugetDependencies extends Project {
    private nugetDependencies: NugetDependencies = {};

    public async getNugetPackageDependencies(): Promise<NugetDependencies> {
        await this.checkNugetDependenciesLoaded();
        return this.nugetDependencies;
    }

    public preload(): Promise<void> {
        this.nugetDependencies = {};
        return Promise.resolve();
    }

    public async refresh(): Promise<void> {
        this.nugetDependencies = {};
        return this.checkNugetDependenciesLoaded();
    }

    private async checkNugetDependenciesLoaded(): Promise<void> {
        if (Object.keys(this.nugetDependencies).length === 0) {
            this.nugetDependencies = await getNugetDependencies(this.projectFullPath);
        }
    }
}
