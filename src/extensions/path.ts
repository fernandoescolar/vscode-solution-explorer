import * as path from "path";

export const sep: string = path.sep;

export function basename(filepath: string, ext?: string): string {
    return path.basename(filepath, ext);
}

export function dirname(filepath: string): string {
    return path.dirname(filepath);
}

export function extname(filepath: string): string {
    return path.extname(filepath);
}

export function join(...paths: string[]): string {
    return path.join(...paths);
}

export function relative(from: string, to: string): string {
    return path.relative(from, to);
}

export function resolve(...paths: string[]): string {
    return path.resolve(...paths);
}
