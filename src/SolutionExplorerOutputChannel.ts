import { window, OutputChannel } from "vscode";
import { EventTypes, IEvent, ILogEvent, LogEventType, IEventAggregator, ISubscription } from "@events";
import * as config from "@extensions/config";

export class SolutionExplorerOutputChannel {
    private outputChannel: OutputChannel | undefined;
    private subscription: ISubscription | undefined;

    constructor(public readonly eventAggregator: IEventAggregator) {
    }

    public register(): void {
        this.outputChannel = window.createOutputChannel('Solution Explorer');
        this.subscription = this.eventAggregator.subscribe(EventTypes.log, e => this.onEventHandled(e));
    }

    public unregister(): void {
        if (this.outputChannel) {
            this.outputChannel.dispose();
            this.outputChannel = undefined;
        }

        if (this.subscription) {
            this.subscription.dispose();
            this.subscription = undefined;
        }
    }

    private onEventHandled(event: IEvent): void {
        if (!this.outputChannel) { return; }

        let logEvent = <ILogEvent> event;
        if (logEvent.logEventType === LogEventType.clear) {
            this.outputChannel.clear();
        }

        if (logEvent.logEventType === LogEventType.append) {
            if (config.getOutputChannelMode() !== "none") {
                this.outputChannel.appendLine(logEvent.text);
            }

            if (config.getOutputChannelMode() === "show") {
                this.outputChannel.show();
            }
        }
    }
}
