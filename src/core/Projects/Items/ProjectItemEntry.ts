export type ProjectItemEntry = {
    name: string;
    fullPath: string;
    relativePath: string;
    isDirectory: boolean;
    isLink: boolean;
    dependentUpon: string | undefined;
};
