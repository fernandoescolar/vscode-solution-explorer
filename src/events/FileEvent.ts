import { IFileEvent } from "./IFileEvent";
import { FileEventType } from "./FileEventType";
import { EventTypes } from "./EventTypes";

export class FileEvent implements IFileEvent {
    constructor(private readonly type: FileEventType, private readonly path: string) {
    }

    public get EventType(): string {
        return EventTypes.File;
    }

    public get FileEventType(): FileEventType {
        return this.type;
    }

    public get Path(): string {
        return this.path;
    }
}