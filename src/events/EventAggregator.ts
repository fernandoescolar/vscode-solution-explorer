import { IEventAggregator, Callback } from "./IEventAggregator";
import { IEvent } from "./IEvent";
import { ISubscription } from "./ISubscription";
import { EventTypes } from "./EventTypes";

class Handler {
    constructor(private readonly eventType: string | EventTypes, private readonly callback: Function) {
    }

    handle(event: IEvent) {
        if (event.eventType === this.eventType) {
            this.callback.call(null, event);
        }
    }
}

export class EventAggregator implements IEventAggregator {
    private eventHandlers: { [id: string]: Handler[] } = {};

    constructor() {
    }

    public publish(event: IEvent): void {
        if (!event) {
            throw new Error('Event type is invalid.');
        }

        setTimeout(() => { // i want to create files before call the event
            let handlers = this.eventHandlers[event.eventType];
            if (handlers) {
                handlers = handlers.slice();
                handlers.forEach(handler => {
                    handler.handle(event);
                });
            }
        }, 1);
    }

    public subscribe(eventType: string | EventTypes, callback: Callback): ISubscription {
        if (!eventType) {
            throw new Error('Event type was invalid.');
        }

        let handler = new Handler(eventType, callback);
        let subscribers = this.eventHandlers[eventType] || (this.eventHandlers[eventType] = []);

        subscribers.push(handler);

        return {
            dispose() {
                let idx = subscribers.indexOf(handler);
                if (idx !== -1) {
                    subscribers.splice(idx, 1);
                }
            }
        };
    }

    public subscribeOnce(eventType: string | EventTypes, callback: Callback): ISubscription {
        let sub = this.subscribe(eventType, (event) => {
            sub.dispose();
            return callback(event);
        });

        return sub;
    }
}