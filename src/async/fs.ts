import * as fs from "fs";
import { Promisify } from "./Promisify";

export type Encoding = 'ascii'|'base64'|'binary'|'hex'|'ucs2'|'utf16le'|'utf8';
export type Flags = 'r'|'r+'|'rs'|'rs+'|'w'|'wx'|'w+'|'wx+'|'a'|'ax'|'a+'|'ax+';

// returns value in error parameter
// export function exists(path: string) { return Promisify<boolean>(fs.exists, arguments); }

export function exists(path: string) {
    return new Promise<boolean>((resolve, reject) => 
        fs.lstat(path, err => 
            !err ? resolve(true) : err.code === 'ENOENT' ? resolve(false) : reject(err)));
}

export function lstat(path: string) { return Promisify<fs.Stats>(fs.lstat, arguments); }

export function mkdir(path: string, mode?: number|string) { return Promisify<void>(fs.mkdir, arguments); }

export function readdir(path: string) { return Promisify<string[]>(fs.readdir, arguments); }

export function readFile(file: string|number, 
    options?: { 
        encoding?: Encoding;
        flag?: Flags; } | Encoding | Flags
    ) { return Promisify<any>(fs.readFile, arguments); }

export function rename(oldPath: string, newPath: string) { return Promisify<void>(fs.rename, arguments); }

export function rmdir(path: string) { return Promisify<void>(fs.rmdir, arguments); }

export function writeFile(file: string|number, data: string|any, 
    options?: { 
        encoding?: Encoding; 
        flag?: Flags; 
        mode?: number|string } | Encoding | Flags
    ) { return Promisify<any>(fs.writeFile, arguments); }

export function unlink(path: string) { return Promisify<void>(fs.unlink, arguments); }