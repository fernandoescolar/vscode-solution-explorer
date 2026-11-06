import { ContextValues, TreeItem } from "@tree";
import { Project, ProjectFactory } from "@core/Projects";
import { Action, SyncNamespaces } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class SyncNamespacesCommand extends SingleItemActionsCommand {
    constructor() {
        super('Sync namespaces');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        if (!item) { return false; }

        return this.isSolutionRoot(item) || this.isCSharpProject(item);
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item) { return []; }

        if (this.isSolutionRoot(item)) {
            const projects = await this.loadCSharpProjects(item);
            return [ new SyncNamespaces(projects, item.solution.name) ];
        }

        if (item.project) {
            return [ new SyncNamespaces([ item.project ], item.project.name) ];
        }

        return [];
    }

    private isSolutionRoot(item: TreeItem): boolean {
        return !!item.solution && ContextValues.both(ContextValues.solution).includes(item.contextValue);
    }

    private isCSharpProject(item: TreeItem): boolean {
        return !!item.project
            && isCSharpProjectFile(item.project.fullPath)
            && ContextValues.both(ContextValues.project).includes(item.contextValue);
    }

    // Reuses the projects already loaded by the tree (walking solution folders), so nothing is parsed
    // again. Projects missing from the tree are parsed from the solution as a fallback.
    private async loadCSharpProjects(item: TreeItem): Promise<Project[]> {
        const projects = new Map<string, Project>();

        const visit = async (node: TreeItem): Promise<void> => {
            for (const child of await node.getChildren()) {
                if (child.project && ContextValues.both(ContextValues.project).includes(child.contextValue)) {
                    addProject(projects, child.project);
                } else if (child.contextValue === ContextValues.solutionFolder) {
                    await visit(child);
                }
            }
        };

        await visit(item);

        for (const solutionProject of item.solution.getAllProjects()) {
            const fullPath = solutionProject.fullPath;
            if (!fullPath || !isCSharpProjectFile(fullPath) || projects.has(fullPath.toLowerCase())) {
                continue;
            }

            const project = await ProjectFactory.parse(solutionProject);
            if (project) {
                addProject(projects, project);
            }
        }

        return [ ...projects.values() ];
    }
}

function addProject(projects: Map<string, Project>, project: Project): void {
    const key = project.fullPath.toLowerCase();
    if (isCSharpProjectFile(project.fullPath) && !projects.has(key)) {
        projects.set(key, project);
    }
}

function isCSharpProjectFile(fullPath: string): boolean {
    return fullPath.toLowerCase().endsWith(".csproj");
}
