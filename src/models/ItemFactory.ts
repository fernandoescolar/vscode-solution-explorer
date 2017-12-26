import * as fs from 'fs' 
import * as path from 'path'
import SolutionLine from './SolutionLine'
import Item from '../items/Item'
import SolutionItem from '../items/SolutionItem'
import SolutionFolderItem from '../items/SolutionFolderItem'
import ProjectItem from '../items/ProjectItem'
import CspCsProjectItem from '../items/CspCsProjectItem'
import UnknownProjectItem from '../items/UnknownProjectItem'
import FolderItem from '../items/FolderItem'
import FileItem from '../items/FileItem'

const vbProjectGuid = "{F184B08F-C81C-45F6-A57F-5ABD9991F28F}";
const csProjectGuid = "{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}";
const cpsProjectGuid = "{13B669BE-BB05-4DDF-9536-439F39A36129}"; //common project system
const cpsCsProjectGuid = "{9A19103F-16F7-4668-BE54-9A1E7A4F7556}"; //common project system
const cpsVbProjectGuid = "{778DAE3C-4631-46EA-AA77-85C1314464D9}"; //common project system
const vjProjectGuid = "{E6FDF86B-F3D1-11D4-8576-0002A516ECE8}";
const vcProjectGuid = "{8BC9CEB8-8B4A-11D0-8D11-00A0C91BC942}";
const fsProjectGuid = "{F2A71F9B-5D33-465A-A702-920D77279786}";
const dbProjectGuid = "{C8D11400-126E-41CD-887F-60BD40844F9E}";
const wdProjectGuid = "{2CFEAB61-6A3B-4EB8-B523-560B4BEEF521}";
const webProjectGuid = "{E24C65DC-7377-472B-9ABA-BC803B73C61A}";
const solutionFolderGuid = "{2150E333-8FDC-42A3-9474-1A3956D46DE8}";

export function createSolutionItem(solutionPath: string): Item {
    return new SolutionItem(solutionPath);
} 

export function createSolutionChildItem(item: SolutionLine) : Item {
    if (item.typeId === solutionFolderGuid) return new SolutionFolderItem(item.name);
    if (item.typeId === cpsCsProjectGuid) return new CspCsProjectItem(item.name, item.path);
    return new UnknownProjectItem(item.name, item.path);
}

export function createFolderItem(name: string, folderPath: string): Item {
    return new FolderItem(name, folderPath);
}

export function createFileItem(name: string, filePath: string): Item {
    return new FileItem(name, filePath);
}
