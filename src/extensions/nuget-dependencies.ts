import * as path from "@extensions/path";
import * as fs from "@extensions/fs";

const OBJ_FOLDER_NAME = 'obj';
const PROJECT_ASSETS_JSON_FILE_NAME = 'project.assets.json';

type Library = {
    sha512: string;
    type: string;
    path: string;
    files: string[];
};

type ProjectAssetsJson = {
    targets: {
        [key: string]: {
            [key: string]: {
                type: string;
                dependencies: { [key: string]: string; };
                compile: { [key: string]: string; };
                runtime: { [key: string]: string; };
            }
        }
    };
    libraries: {
        [key: string]: Library
    };
    project: {
        version: string;
        restore: {
            projectUniqueName: string;
            projectName: string;
            projectPath: string;
            packagesPath: string;
            outputPath: string;
            projectStyle: string;
            configFilePaths: string[];
            originalTargetFrameworks: string[];
            sources: { [key: string]: any };
            frameworks: { [key: string]: any };
            warningProperties: { [key: string]: string[] };
        };
        frameworks: {
            [key: string]: {
                targetAlias: string;
                dependencies: { [key: string]: { target: string; version: string; }; };
                imports: string[];
                assetTargetFallback: boolean;
                warn: boolean;
                frameworkReferences: { [key: string]: any };
                runtimeIdentifierGraphPath: string;
            }
        }
    };
};
export type NugetDependenciesCollection = { [key: string]: string; };
export type NugetDependencies = {
    [key: string]: {
        version: string;
        dependencies: NugetDependenciesCollection;
    }
};

function getProjectAssetsJsonPath(projectPath: string): string {
    return path.join(projectPath, OBJ_FOLDER_NAME, PROJECT_ASSETS_JSON_FILE_NAME);
}

async function getProjectAssetsJson(projectPath: string): Promise<ProjectAssetsJson | undefined> {
    const projectAssetsJsonPath = getProjectAssetsJsonPath(projectPath);
    const exists = await fs.exists(projectAssetsJsonPath)
    if (exists) {
        const projectAssetsJsonContent = await fs.readFile(projectAssetsJsonPath);
        return JSON.parse(projectAssetsJsonContent);
    }

    return undefined;
}

function getNugetDependences(project: ProjectAssetsJson, key: string): NugetDependenciesCollection {
    const dependencies: NugetDependenciesCollection = {};
    for (const t in project.targets) {
        const target = project.targets[t];
        const l = target[key];
        if (l && l.dependencies) {
            for (const dependencyKey in l.dependencies) {
                const dependency = l.dependencies[dependencyKey];
                if (dependency) {
                    dependencies[dependencyKey] = dependency;
                }
            }
        }
    }

    return dependencies;
}

export async function getNugetDependencies(projectPath: string): Promise<NugetDependencies> {
    const dependencies: NugetDependencies = {};
    const folderpath = path.dirname(projectPath);
    const projectAssetsJson = await getProjectAssetsJson(folderpath);
    if (projectAssetsJson && projectAssetsJson.libraries) {
        for (const key in projectAssetsJson.libraries) {
            const library = projectAssetsJson.libraries[key];
            if (library.type === 'project') {
                continue;
            }

            const name = library.path.split('/')[0];
            const version = library.path.split('/')[1];
            dependencies[name] = {
                version,
                dependencies: getNugetDependences(projectAssetsJson, key)
            };
        }

        return dependencies;
    }

    return {};
}

