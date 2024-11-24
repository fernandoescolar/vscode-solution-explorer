import * as path from "@extensions/path";
import * as config from "@extensions/config";
import * as Utilities from "@core/Utilities";
import { EventTypes, IEvent, IEventAggregator, ISolutionSelected, ISubscription } from "@events";

export type FoundPath = { root: string, sln: string };

export class SolutionFinder {

    private subscription: ISubscription | undefined;
    private openCommandSolutionPath: string | undefined;

    constructor(private workspaceRoots: string[], private readonly eventAggregator: IEventAggregator) {
    }

	public get hasWorkspaceRoots(): boolean {
		return this.workspaceRoots.length > 0;
	}

	public register(): void {
		this.subscription = this.eventAggregator.subscribe(EventTypes.solution, evt => this.onSolutionEvent(evt));
	}

	public isWorkspaceSolutionFile(filePath: string): boolean {
		return this.workspaceRoots.indexOf(path.dirname(filePath)) >= 0
		    	&& (filePath.endsWith('.sln') || filePath.endsWith('.slnx'));
	}

    public async findSolutions(): Promise<FoundPath[]> {
		let solutionPaths: FoundPath[] = [];

		if (this.openCommandSolutionPath) {
			solutionPaths.push({ root: path.dirname(this.openCommandSolutionPath), sln: this.openCommandSolutionPath });
		}

		if (config.getOpenSolutionsInRootFolder()) {
			for (let i = 0; i < this.workspaceRoots.length; i++) {
				const paths = await Utilities.searchFilesInDir(this.workspaceRoots[i], ['.sln', '.slnx']);
				paths.forEach(p => solutionPaths.push({ root: this.workspaceRoots[i], sln: p }));
			}
		}

		if (config.getOpenSolutionsInAltFolders()) {
			let altFolders = config.getAlternativeSolutionFolders();
			for (let i = 0; i < altFolders.length; i++) {
				for (let j = 0; j < this.workspaceRoots.length; j++) {
					const paths = await Utilities.searchFilesInDir(path.join(this.workspaceRoots[j], altFolders[i]), ['.sln', '.slnx']);
					paths.forEach(p => solutionPaths.push({ root: this.workspaceRoots[j], sln: p }));
				}
			}
		}

		if (config.getOpenSolutionsInFoldersAndSubfolders()) {
			for (let i = 0; i < this.workspaceRoots.length; i++) {
				const paths = await Utilities.searchFilesInDir(this.workspaceRoots[i], ['.sln', '.slnx'], true);
				paths.forEach(p => solutionPaths.push({ root: this.workspaceRoots[i], sln: p }));
			}
		}

		return SolutionFinder.removeDuplicates(solutionPaths);
	}

    public unregister() {
        if (this.subscription) {
            this.subscription.dispose();
            this.subscription = undefined;
        }
    }

    private onSolutionEvent(event: IEvent): void {
		let solutionEvent = <ISolutionSelected> event;
		this.openCommandSolutionPath = solutionEvent.slnPath;
	}

	private static removeDuplicates(array: FoundPath[]): FoundPath[] {
		let result: FoundPath[] = [];
		for (let i = 0; i < array.length; i++) {
			if (result.findIndex(x => x.sln === array[i].sln) === -1) {
				result.push(array[i]);
			}
		}

		return result;
	}
}
