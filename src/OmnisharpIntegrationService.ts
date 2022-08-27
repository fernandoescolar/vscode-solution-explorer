import * as vscode from "vscode";
import * as config from "@extensions/config";
import { IEventAggregator, SolutionSelected } from "@events";

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

const CSHARP_EXTENSION_ID = 'ms-dotnettools.csharp';
const SELECT_SOLUTION_EVENT_TYPE = 4;
const SOLUTION_EXTENSION = '.sln';

export class OmnisharpIntegrationService extends vscode.Disposable {

    private subscription: Subscription | undefined;
    private active: boolean = false;

    constructor(public readonly eventAggregator: IEventAggregator) {
        super(() => this.unregister());
    }

    public register() {
        this.active = config.getOpenSolutionsSelectedInOmnisharp();
        if (!this.active) { return; }

        const checker = setInterval(() => {
            const extension = vscode.extensions.getExtension(CSHARP_EXTENSION_ID) as any;
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
            if (event.solutionPath && event.solutionPath.toLocaleLowerCase().endsWith(SOLUTION_EXTENSION)) {
                const e = new SolutionSelected(event.solutionPath);
                this.eventAggregator.publish(e);
            }
        }
    }
}
