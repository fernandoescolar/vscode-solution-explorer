import * as vscode from "vscode";
import * as SolutionExplorerConfiguration from "./SolutionExplorerConfiguration";
import { IEventAggregator, SolutionSelected } from "./events";

interface BaseEvent {
    type: number;
    solutionPath?: string;
}

interface Subscription {
    unsubscribe(): void;
}

interface EventStream {
    subscribe(eventHandler: (event: BaseEvent) => void): Subscription;
}

const CSharpExtensionId = 'ms-dotnettools.csharp';
const SelectSolutionEventType = 4;
const SolutionExtension = '.sln';

export class OmnisharpIntegrationService extends vscode.Disposable {

    private subscription: Subscription;
    private active: boolean;

    constructor(public readonly eventAggregator: IEventAggregator) {
        super(() => this.unregister());
    }

    public register() {
        this.active = SolutionExplorerConfiguration.getOpenSolutionsSelectedInOmnisharp();
        if (!this.active) return;

        const checker = setInterval(() => {
            const extension = vscode.extensions.getExtension(CSharpExtensionId);
            if (!extension) {
                clearInterval(checker);
            }

            if (extension.exports) {
                this.start(extension);
                clearInterval(checker);
            } else {
                extension.activate().then(() => this.start(extension));
                clearInterval(checker);
            }
        }, 0);
    }

    public unregister(): void {
        if (this.active && this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    private start(extension: vscode.Extension<any>): void {
        if (extension.id === CSharpExtensionId) {
            const eventStream = extension.exports.eventStream as EventStream;
            if (eventStream) {
                this.subscription = eventStream.subscribe(event => this.handleEvent(event));
            }
        }
    }

    private handleEvent(event: BaseEvent): void {
        if (event.type === SelectSolutionEventType) {
            if (event.solutionPath && event.solutionPath.toLocaleLowerCase().endsWith(SolutionExtension)) {
                const e = new SolutionSelected(event.solutionPath);
                this.eventAggregator.publish(e);
            }
        }
    }
}
