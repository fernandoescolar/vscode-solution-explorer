import * as vscode from "vscode";
import * as config from "@extensions/config";
import { IEventAggregator, SolutionSelected } from "@events";

interface BaseEvent {
    type: number;
}

interface OmnisharpInitialisationEvent extends BaseEvent {
    dotNetCliPaths: string[];
    timeStamp: Date;
    solutionPath: string;
}

interface Subscription {
    unsubscribe(): void;
}

interface EventStream {
    subscribe(eventHandler: (event: BaseEvent) => void): Subscription;
}

const CSHARP_EXTENSION_ID = 'ms-dotnettools.csharp';
const SELECT_SOLUTION_EVENT_TYPE = 4;
const SOLUTION_EXTENSION = '.sln';
const SOLUTIONX_EXTENSION = '.slnx';

export class OmnisharpIntegrationService extends vscode.Disposable {

    private subscription: Subscription | undefined;
    private active: boolean = false;

    constructor(public readonly eventAggregator: IEventAggregator) {
        super(() => this.unregister());
    }

    public register() {
        this.active = config.getOpenSolutionsSelectedInOmnisharp();
        if (!this.active) {
          return;
        }

        const extension = vscode.extensions.getExtension(CSHARP_EXTENSION_ID);
        if (extension) {
            if (extension.isActive && extension.exports) {
                this.start(extension);
            } else {
                extension.activate().then(() => this.start(extension));
            }
        }
    }

    public unregister(): void {
        if (this.active && this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }

    private start(extension: vscode.Extension<any>): void {
        if (extension.id === CSHARP_EXTENSION_ID) {
            const eventStream = extension.exports.eventStream as EventStream;
            if (eventStream) {
                this.subscription = eventStream.subscribe(event => this.handleEvent(event));
            }
        }
    }

    private handleEvent(event: BaseEvent): void {
        if (event.type === SELECT_SOLUTION_EVENT_TYPE) {
            const solutionPath = (event as OmnisharpInitialisationEvent).solutionPath;
            if (solutionPath.toLocaleLowerCase().endsWith(SOLUTION_EXTENSION)) {
                const e = new SolutionSelected(solutionPath);
                this.eventAggregator.publish(e);
            }
            if (solutionPath.toLocaleLowerCase().endsWith(SOLUTIONX_EXTENSION)) {
                const e = new SolutionSelected(solutionPath);
                this.eventAggregator.publish(e);
            }
        }
    }
}
