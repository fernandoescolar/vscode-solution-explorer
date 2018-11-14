import { CommandParameterCompiler } from "./CommandParameterCompiler";

export interface ICommandParameter {
    readonly shouldAskUser: boolean;
    setArguments(state: CommandParameterCompiler): Promise<void>;
    getArguments(): string[];
}