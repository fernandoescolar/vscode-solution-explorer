import { window, OutputChannel } from "vscode";
import { EventTypes, IEvent, ILogEvent, LogEventType, IEventAggegator, ISubscription } from "./events";

export class SolutionExplorerOutputChannel {
    private outputChannel: OutputChannel;
    private subscription: ISubscription;

    constructor(public readonly eventAggregator: IEventAggegator){
    }

    public register(): void {
        this.outputChannel = window.createOutputChannel('Solution Explorer');
        this.subscription = this.eventAggregator.subscribe(EventTypes.Log, e => this.onEventHandled(e))
    }

    public unregister(): void {
        this.outputChannel.dispose();
        this.outputChannel = null;
        this.subscription.dispose();
        this.subscription = null;
    }

    private onEventHandled(event: IEvent): void {
        let logEvent = <ILogEvent> event;
        if (logEvent.logEventType == LogEventType.Clear) this.outputChannel.clear();
        if (logEvent.logEventType == LogEventType.Append) {
            this.outputChannel.appendLine(logEvent.text);
            this.outputChannel.show();
        }
    }
}