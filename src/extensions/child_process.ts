import * as os from 'os';
import * as process from 'child_process';
import * as config from '@extensions/config';
import * as iconv from 'iconv-lite';

export function execSync(command: string): string {
    let buffer = process.execSync(command);
    if (!buffer) {
        return '';
    }
    return buffer.toString();
}

function decode(data: Buffer): string {
    var codepage = getCurrentEncoding();
    var encodings = config.getWin32EncodingTable();
    var keys = Object.keys(encodings);
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] === codepage) {
            return iconv.decode(data, encodings[keys[i]]);
        }
    }

    return data.toString();
}

let codepage: string | undefined = undefined;
function getCurrentEncoding(): string {
    if (!codepage) {
        if (os.platform() === "win32") {
            let buffer = process.execSync('chcp');
            if (buffer) {
                const str = buffer.toString();
                const parts = str.split(':');
                if (parts.length > 1) {
                    codepage = parts[1].trim();
                    return codepage;
                }
            }
        }

        codepage = '65001';
    }

    return codepage;
}