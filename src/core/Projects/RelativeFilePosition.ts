
export enum Direction {
    Above = "above",
    Below = "below"
}

export type RelativeFilePosition = { fullpath: string; direction: Direction};