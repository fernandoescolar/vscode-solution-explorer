import * as fs from "@extensions/fs";
import { Solution } from './model';
import { SlnLoader } from "./SlnLoader";
import { SlnxSolution } from "./slnx/Slnx";

export class SolutionFactory {
    public static async load(path: string): Promise<Solution> {
        if (!fs.exists(path)) {
            throw new Error(`Solution file not found: ${path}`);
        }

        if (path.endsWith(".sln")) {
            return SlnLoader.load(path);
        }

        if (path.endsWith(".slnx")) {
            const s = new SlnxSolution();
            await s.load(path);
            return s;
        }

        return new Solution();
    }
}

