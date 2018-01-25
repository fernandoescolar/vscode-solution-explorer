import { IEvent } from "../IEvent";
import { FileEventType } from "./FileEventType";

export interface IFileEvent extends IEvent {
    readonly fileEventType: FileEventType;
    readonly path: string;
}