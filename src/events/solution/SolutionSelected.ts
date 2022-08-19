import { EventTypes } from "../EventTypes";
import { ISolutionSelected } from "./ISolutionSelected";

export class SolutionSelected implements ISolutionSelected {
    constructor(public readonly slnPath: string) {
    }

    public get eventType(): string {
        return EventTypes.solution;
    }
}
