import { IEvent } from "./IEvent";
import { FileEventType } from "./FileEventType";

export interface IFileEvent extends IEvent {
    readonly FileEventType: FileEventType;
    readonly Path: string;
}