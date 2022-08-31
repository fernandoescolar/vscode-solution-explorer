
export class Reference {
    public readonly name: string;
    public readonly version: string | undefined;

    constructor(input: string) {
        if (Reference.isFullyQualifiedName(input)) {
            const { name, version } = Reference.getNameAndVersion(input);
            this.name = name;
            this.version = version;
        } else {
            this.name = input;
        }
    }

    private static isFullyQualifiedName(input: string) {
        if (input.indexOf(',') < 0) {
            return false;
        }

        return true;
    }

    private static getNameAndVersion(fullyQualifiedName: string): { name: string; version: string | undefined; } {
        const parts = fullyQualifiedName.split(',');
        const version = parts.find(p => p.trim().startsWith('Version='));
        return {
            name: parts[0],
            version: version ? version.split('=')[1] : undefined
        };
    }
}
