import * as path from "path";
import * as fs from "fs";
import { ContextValues } from "./ContextValues";
var $dirname;

function getFileIconPath(filename: string): string {
    return path.join(__dirname, '..', 'icons', filename);
}

function getIconPath(lightFilename: string, darkFilename: string = null): { light: string; dark: string } {
    return {
        light: getFileIconPath(lightFilename),
        dark: getFileIconPath(darkFilename ? darkFilename : lightFilename)
    };
}

function getIconPathFromExtension(path: string, alternative: string) {
    if (path) {
        let extension = path.split('.').pop();
        let iconpath = getFileIconPath(extension + '.svg');
        if (fs.existsSync(iconpath))
            return getIconPath(extension + '.svg');
        iconpath = getFileIconPath(extension + '.png');
        if (fs.existsSync(iconpath))
            return getIconPath(extension + '.png');
    }
    
    return getIconPath(alternative);
}

export function findIconPath(name: string, path: string, contextValue: string): { light: string; dark: string } {
    if (contextValue == ContextValues.Solution) {
        return getIconPath('sln.svg');
    } else
    if (contextValue.startsWith(ContextValues.ProjectFile)) {
        return getIconPathFromExtension(path, 'file.svg');
    } else 
    if (contextValue.startsWith(ContextValues.ProjectReferences)) {
        return getIconPath('references.svg');
    } else 
    if (contextValue.startsWith(ContextValues.ProjectReferencedProject)) {
        return getIconPath('referenced-project.svg');
    } else 
    if (contextValue.startsWith(ContextValues.ProjectReferencedPackage)) {
        return getIconPath('packages.svg');
    } else
    if (contextValue == ContextValues.SolutionFolder || contextValue.startsWith(ContextValues.ProjectFolder)) {
        if (path && path.endsWith("wwwroot"))
            return getIconPath('wwwroot.svg');

        return getIconPath('folder.svg');
    } else 
    if (contextValue.startsWith(ContextValues.Project)) {
        return getIconPathFromExtension(path, 'csproj.svg');
    } 

    return getIconPath('file.svg');
}