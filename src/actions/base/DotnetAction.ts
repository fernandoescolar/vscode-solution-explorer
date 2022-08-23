import { TerminalAction } from "./TerminalAction";

export abstract class DotnetAction extends TerminalAction {
   constructor(args: string[], workingFolder: string) {
         super([ "dotnet", ...args], workingFolder);
   }
}