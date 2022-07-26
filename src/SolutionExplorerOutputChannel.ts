import { window, OutputChannel } from "vscode";
import { EventTypes, IEvent, ILogEvent, LogEventType, IEventAggregator, ISubscription } from "./events";
import * as SolutionExplorerConfiguration from "./SolutionExplorerConfiguration";

export class SolutionExplorerOutputChannel {
    private outputChannel: OutputChannel;
    private subscription: ISubscription;
    private shouldShow: boolean;

    constructor(public readonly eventAggregator: IEventAggregator) {
    }

    public register(): void {
        this.shouldShow = SolutionExplorerConfiguration.getShowOutputChannel();
        if (!this.shouldShow) return;

        this.outputChannel = window.createOutputChannel('Solution Explorer');
        this.subscription = this.eventAggregator.subscribe(EventTypes.Log, e => this.onEventHandled(e))
    }

    public unregister(): void {
        if (this.outputChannel)
            this.outputChannel.dispose();
        if (this.subscription)
            this.subscription.dispose();

        this.outputChannel = null;
        this.subscription = null;
    }

    private onEventHandled(event: IEvent): void {
        if (!this.shouldShow) return;

        let logEvent = <ILogEvent> event;
        if (logEvent.logEventType == LogEventType.Clear) this.outputChannel.clear();
        if (logEvent.logEventType == LogEventType.Append) {
            this.outputChannel.appendLine(logEvent.text);
            this.outputChannel.show();
        }
    }
}