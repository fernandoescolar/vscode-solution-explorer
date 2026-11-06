import * as vscode from "vscode";
import { t } from "@extensions/translations";
import * as path from "@extensions/path";
import * as config from "@extensions/config";
import * as dialogs from "@extensions/dialogs";
import { mapWithConcurrency } from "@extensions/concurrency";
import { Project } from "@core/Projects";
import { getExpectedNamespace, getRootNamespace, syncNamespaceDeclaration } from "@core/Namespaces/CSharpNamespace";
import { Action, ActionContext } from "./base/Action";

// how many files are read or written at the same time
const FILE_CONCURRENCY = 16;

type Candidate = { projectPath: string; filePath: string; expectedNamespace: string };
type PendingUpdate = { projectPath: string; filePath: string; content: string };

// C# files are often saved with a UTF-8 BOM. Keep it as a "﻿" character when reading
// (the default TextDecoder drops it) so it is written back unchanged.
async function readTextFile(filePath: string): Promise<string> {
    const bytes = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
    return new TextDecoder("utf-8", { ignoreBOM: true }).decode(bytes);
}

async function writeTextFile(filePath: string, content: string): Promise<void> {
    await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), new TextEncoder().encode(content));
}

/**
 * Updates the namespace declarations of the C# files of one or more projects so they match
 * the folder structure. `scopeName` is the project or solution name shown in the messages.
 */
export class SyncNamespaces implements Action {
    constructor(private readonly projects: Project[], private readonly scopeName: string) {
    }

    public toString(): string {
        return `Sync namespaces in ${this.scopeName}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        if (this.projects.length === 0) {
            await vscode.window.showInformationMessage(t("No C# projects found in '{0}'.", this.scopeName));
            return;
        }

        const updates = await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Window, title: t("Sync namespaces") },
            () => this.getPendingUpdates()
        );

        if (updates.length === 0) {
            await vscode.window.showInformationMessage(t("All namespaces in '{0}' already match the folder structure.", this.scopeName));
            return;
        }

        const projectsWithUpdates = new Set(updates.map(u => u.projectPath)).size;
        const isSingleProject = this.projects.length === 1;
        const update = t("Update");
        const question = isSingleProject
            ? t("Update the namespace of {0} file(s) in '{1}' to match the folder structure? References in other files are not updated.", updates.length, this.scopeName)
            : t("Update the namespace of {0} file(s) in {1} project(s) of '{2}' to match the folder structure? References in other files are not updated.", updates.length, projectsWithUpdates, this.scopeName);

        const option = await dialogs.confirm(question, update);
        if (option !== update) {
            return;
        }

        await mapWithConcurrency(updates, FILE_CONCURRENCY, pending => writeTextFile(pending.filePath, pending.content));

        const done = isSingleProject
            ? t("Updated the namespace of {0} file(s) in '{1}'.", updates.length, this.scopeName)
            : t("Updated the namespace of {0} file(s) in {1} project(s) of '{2}'.", updates.length, projectsWithUpdates, this.scopeName);

        await vscode.window.showInformationMessage(done);
    }

    private async getPendingUpdates(): Promise<PendingUpdate[]> {
        const ignoredFolders = config.getNetCoreIgnore().map(folder => folder.toLowerCase());
        const candidatesByProject = await Promise.all(this.projects.map(project => getCandidates(project, ignoredFolders)));
        const candidates = candidatesByProject.flat();

        const results = await mapWithConcurrency(candidates, FILE_CONCURRENCY, async candidate => {
            const content = await readTextFile(candidate.filePath);
            const result = syncNamespaceDeclaration(content, candidate.expectedNamespace);
            return result.status === "updated"
                ? { projectPath: candidate.projectPath, filePath: candidate.filePath, content: result.content }
                : undefined;
        });

        return results.filter((update): update is PendingUpdate => !!update);
    }
}

// .cs files of the project inside the project directory, with the namespace each one should have
async function getCandidates(project: Project, ignoredFolders: string[]): Promise<Candidate[]> {
    const projectDirectory = path.dirname(project.fullPath);
    const properties = await project.getProperties();
    const rootNamespace = getRootNamespace(properties.RootNamespace, project.name);
    const entries = await project.getProjectItemEntries();
    const candidates: Candidate[] = [];

    for (const entry of entries) {
        if (entry.isDirectory || entry.isLink || path.extname(entry.fullPath).toLowerCase() !== ".cs") {
            continue;
        }

        const folderSegments = getFolderSegments(projectDirectory, entry.fullPath);
        if (!folderSegments || folderSegments.some(segment => ignoredFolders.includes(segment.toLowerCase()))) {
            continue;
        }

        candidates.push({
            projectPath: project.fullPath,
            filePath: entry.fullPath,
            expectedNamespace: getExpectedNamespace(rootNamespace, folderSegments)
        });
    }

    return candidates;
}

// folders between the project directory and the file, or undefined when the file is outside the project directory
function getFolderSegments(projectDirectory: string, filePath: string): string[] | undefined {
    const relativeFolder = path.relative(projectDirectory, path.dirname(filePath));
    if (relativeFolder.startsWith("..") || path.resolve(relativeFolder) === relativeFolder) {
        return undefined;
    }

    return relativeFolder.split(/[\\/]/).filter(segment => segment.length > 0 && segment !== ".");
}
