import { IEvent } from "../IEvent";
import { LogEventType } from "./LogEventType";

export interface ILogEvent extends IEvent {
    readonly logEventType: LogEventType;
    readonly text: string;
}