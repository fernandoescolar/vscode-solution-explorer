import { IEvent } from "../IEvent";

export interface ISolutionSelected extends IEvent {
    readonly slnPath: string;
}