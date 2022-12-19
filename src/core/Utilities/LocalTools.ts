import { execSync } from 'child_process';

export type LocalTool = {
    name: string,
    version: string
    commands?: string
}

export class LocalTools {
    public static getInstalledLocalTools(rootPath: string): LocalTool[] {
        let buffer: Buffer;
        try {
            buffer = execSync('dotnet tool list --local', {
                cwd: rootPath
            });
        } catch {
            return [];
        }

        if (!buffer) {
            return [];
        }

        const localTools: LocalTool[] = [];

        let lines = buffer.toString().split('\n');
        if (lines.length > 2) {
            lines.splice(0, 2); /* ignore header */
            lines.forEach(line => {
                let [name, version, commands] = line.split('  ').filter(element => element);
                if (name && version) {
                    localTools.push({
                        name,
                        version,
                        commands
                    });
                }
            });
        }
        return localTools;
    }
}