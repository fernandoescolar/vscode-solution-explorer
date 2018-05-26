import { window } from "vscode";
import { ILogger } from "./ILogger";
import { IEventAggegator, LogEvent, LogEventType } from "../events";

export class Logger implements ILogger {
    constructor(private readonly eventAggregator: IEventAggegator) {
    }

    public log(text: string): void {
        let event = new LogEvent(LogEventType.Append, text);
		this.eventAggregator.publish(event);
    }
    
    public info(text: string): void {
        if (!text) return;
        this.log("info: " + text);
		window.showInformationMessage(text);
    }

    public error(text: string): void {
        if (!text) return;
        this.log("error: " + text);
        window.showErrorMessage(text);
    }
    
    public warn(text: string) {
        if (!text) return;
        this.log("warning: " + text);
        window.showWarningMessage(text);
    }
}