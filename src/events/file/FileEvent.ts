import { IFileEvent } from "./IFileEvent";
import { FileEventType } from "./FileEventType";
import { EventTypes } from "../EventTypes";

export class FileEvent implements IFileEvent {
    constructor(public readonly fileEventType: FileEventType, public readonly path: string) {
    }

    public get eventType(): string {
        return EventTypes.File;
    }
}