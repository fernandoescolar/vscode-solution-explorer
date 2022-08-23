import * as path from "@extensions/path";
import * as SolutionExplorerConfiguration from "@extensions/config";
import * as Utilities from "@core/Utilities";
import { EventTypes, IEvent, IEventAggregator, ISolutionSelected, ISubscription } from "@events";

export type FoundPath = { root: string, sln: string };

export class SolutionFinder {

    private subscription: ISubscription | undefined;
    private _selectedSolutionPath: string | undefined;

    constructor(public workspaceRoots: string[], public readonly eventAggregator: IEventAggregator) {
    }

	public register(): void {
		this.subscription = this.eventAggregator.subscribe(EventTypes.solution, evt => this.onSolutionEvent(evt));
	}

    public async findSolutions(): Promise<FoundPath[]> {
		let solutionPaths: FoundPath[] = [];

		if (this._selectedSolutionPath) {
			solutionPaths.push({ root: path.dirname(this._selectedSolutionPath), sln: this._selectedSolutionPath });
		}

		if (SolutionExplorerConfiguration.getOpenSolutionsInRootFolder()) {
			for (let i = 0; i < this.workspaceRoots.length; i++) {
				const paths = await Utilities.searchFilesInDir(this.workspaceRoots[i], '.sln');
				paths.forEach(p => solutionPaths.push({ root: this.workspaceRoots[i], sln: p }));
			}
		}

		if (SolutionExplorerConfiguration.getOpenSolutionsInAltFolders()) {
			let altFolders = SolutionExplorerConfiguration.getAlternativeSolutionFolders();
			for (let i = 0; i < altFolders.length; i++) {
				for (let j = 0; j < this.workspaceRoots.length; j++) {
					const paths = await Utilities.searchFilesInDir(path.join(this.workspaceRoots[j], altFolders[i]), '.sln');
					paths.forEach(p => solutionPaths.push({ root: this.workspaceRoots[j], sln: p }));
				}
			}
		}

		if (SolutionExplorerConfiguration.getOpenSolutionsInFoldersAndSubfolders()) {
			for (let i = 0; i < this.workspaceRoots.length; i++) {
				const paths = await Utilities.searchFilesInDir(this.workspaceRoots[i], '.sln', true);
				paths.forEach(p => solutionPaths.push({ root: this.workspaceRoots[i], sln: p }));
			}
		}

		return SolutionFinder.removeDuplicates(solutionPaths);
	}

    public dispose() {
        if (this.subscription) {
            this.subscription.dispose();
            this.subscription = undefined;
        }
    }

    private onSolutionEvent(event: IEvent): void {
		let solutionEvent = <ISolutionSelected> event;
		this._selectedSolutionPath = solutionEvent.slnPath;
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
