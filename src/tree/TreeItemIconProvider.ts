import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { ContextValues } from "./ContextValues";

type IconPath = { light: string; dark: string };

function getFileIconPath(filename: string): string {
    return path.join(__dirname, '..', 'icons', filename);
}

function getIconPath(lightFilename: string, darkFilename?: string): IconPath {
    return {
        light: getFileIconPath(lightFilename),
        dark: getFileIconPath(darkFilename ? darkFilename : lightFilename)
    };
}

async function getIconPathFromExtension(path: string, alternative: string): Promise<IconPath> {
    if (path) {
        let extension = path.split('.').pop();
        let iconpath = getFileIconPath(extension + '.svg');
        if (await fs.exists(iconpath)) {
            return getIconPath(extension + '.svg');
        }

        iconpath = getFileIconPath(extension + '.png');
        if (await fs.exists(iconpath)) {
            return getIconPath(extension + '.png');
        }
    }

    return getIconPath(alternative);
}

export async function findIconPath(name: string, path: string, contextValue: string): Promise<IconPath> {
    if (contextValue === ContextValues.solution) {
        return getIconPath('sln.svg');
    }

    if (contextValue.startsWith(ContextValues.projectFile)) {
        return await getIconPathFromExtension(path, 'file.svg');
    }

    if (contextValue.startsWith(ContextValues.projectReferences)) {
        return getIconPath('ReferenceGroup.svg','ReferenceGroup-dark.svg');
    }

    if (contextValue.startsWith(ContextValues.projectReferencedProject)) {
        return getIconPath('Application.svg','Application-dark.svg');
    }

    if (contextValue.startsWith(ContextValues.projectReferencedPackage)) {
        return getIconPath('PackageReference.svg','PackageReference-dark.svg');
    }

    if (contextValue === ContextValues.solutionFolder || contextValue.startsWith(ContextValues.projectFolder)) {
        if (path && path.endsWith("wwwroot")) {
            return getIconPath('WebFolderOpened.svg','WebFolderOpened-dark.svg');
        }

        if (path && path.endsWith("Properties")) {
            return getIconPath('PropertiesFolderClosed.svg','PropertiesFolderClosed-dark.svg');
        }

        if (path && path.endsWith(".github")) {
            return getIconPath('github.svg');
        }

        return getIconPath('folder.svg');
    }

    if (contextValue.startsWith(ContextValues.project)) {
        return await getIconPathFromExtension(path, 'csproj.svg');
    }

    if (contextValue.startsWith(ContextValues.localTool)) {
        return getIconPath('PackageReference.svg','PackageReference-dark.svg');
    }

    return getIconPath('file.svg');
}
