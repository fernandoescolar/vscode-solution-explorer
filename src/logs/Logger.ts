import { t } from "@extensions/translations";
import { ILogger } from "./ILogger";
import { IEventAggregator, LogEvent, LogEventType } from "../events";

export class Logger implements ILogger {
    constructor(private readonly eventAggregator: IEventAggregator) {
    }

    public log(text: string): void {
        if (!text) { return; }
        let event = new LogEvent(LogEventType.append, text);
		this.eventAggregator.publish(event);
    }

    public info(text: string): void {
        if (!text) { return; }
        this.log(t("info: {0}", text));
    }

    public error(text: string): void {
        if (!text) { return; }
        this.log(t("error: {0}", text));
    }

    public warn(text: string): void {
        if (!text) { return; }
        this.log(t("warning: {0}", text));
    }
}