import { IEvent } from "./IEvent";
import { EventTypes } from "./EventTypes";
import { ISubscription } from "./ISubscription";

export type Callback = (event: IEvent) => void;

export interface IEventAggregator {
    publish(event: IEvent): void;
    subscribe(eventType: string | EventTypes, callback: Callback): ISubscription;
    subscribeOnce(eventType: string | EventTypes, callback: Callback): ISubscription;
}