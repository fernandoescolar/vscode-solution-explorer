import * as fs from "@extensions/fs";
import { Solution } from './model';
import { SlnLoader } from "./SlnLoader";

export class SolutionFactory {
    public static async load(path: string): Promise<Solution> {
        if (!fs.exists(path)) {
            throw new Error(`Solution file not found: ${path}`);
        }

        if (path.endsWith(".sln")) {
            return SlnLoader.load(path);
        }

        return new Solution();
    }
}

