export interface ICommandParameter {
    setArguments(): Promise<boolean>;
    getArguments(): string[];
}