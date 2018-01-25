import { ILogEvent } from "./ILogEvent";
import { LogEventType } from "./LogEventType";
import { EventTypes } from "../EventTypes";

export class LogEvent implements ILogEvent {
    constructor(public readonly logEventType: LogEventType, public readonly text: string) {
    }

    public get eventType(): string {
        return EventTypes.Log;
    }
}