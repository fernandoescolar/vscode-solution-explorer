import * as fs from 'fs' 
import * as path from 'path'

import Item from './Item'
import SolutionItem from './SolutionItem'
import SolutionFolderItem from './SolutionFolderItem'
import ProjectItem from './ProjectItem'
import FolderItem from './FolderItem'
import FileItem from './FileItem'

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

export function getDirectorySolutions(dirPath: string): Item[] {
    var solutions = searchFilesInDir(dirPath, '.sln', false);
    var result: Item[] = [];
    
    solutions.forEach(s => {
        result.push(createSolutionItem(s));
    });

    return result;
}

export function createSolutionItem(solutionPath: string): Item {
    var name = solutionPath.split('/').pop().replace('.sln', '');
    var item = new SolutionItem(name, solutionPath, parseSolution(solutionPath));
    return item;
} 

export function getDirectoryItems(dirPath: string): Item[] {
    var result: Item[] = []
    if (!fs.existsSync(dirPath)){
        return result;
    }

    var directories = [],  files = []
    var items = fs.readdirSync(dirPath);
    for(var i = 0; i < items.length; i++){
        var filename = path.join(dirPath, items[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            if (['bin', 'obj', 'node_modules'].indexOf(items[i]) < 0 
                && !items[i].startsWith('.'))
                directories.push(items[i]);
        }
        else {
            if (!items[i].endsWith('.csproj'))
                files.push(items[i])
        }
    }

    directories.sort()
    files.sort();

    directories.forEach(i => {
        var folderPath = path.join(dirPath, i);
        result.push(new FolderItem(i, folderPath));
    });

    files.forEach(i => {
        var filePath = path.join(dirPath, i);
        result.push(new FileItem(i, filePath));
    });

    return result;
}


function searchFilesInDir(startPath, extension, recursive?: boolean) : string[] {
    var result: string[] = []
    if (!fs.existsSync(startPath)){
        return result;
    }

    var files = fs.readdirSync(startPath);
    for(var i = 0; i < files.length; i++){
        var filename = path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            if (recursive)
                this.searchFilesInDir(filename, extension, recursive).forEach(i => result.push(i)); 
        }
        else if (filename.endsWith(extension)) {
            result.push(filename);
        }
    }

    return result;
}

function parseSolution(slnPath: string) : Item[] {
    var result: Item[] = [];
    var workspaceRoot = path.dirname(slnPath);
    var lines = fs.readFileSync(slnPath, 'utf8').split('\n');
    var projects = [], relations = [], isNestedProject = false;

    lines.forEach(line => {
        if (line.trim().startsWith('Project(')) {
            var projectRegEx = /Project\("(.*)"\)\s*=\s*"(.*)"\s*,\s*"(.*)"\s*,\s*"(.*)"/g;
            var m = projectRegEx.exec(line);
            if (m) {
                projects.push({
                    typeId: m[1],
                    name: m[2],
                    relativePath: m[3].replace(/\\/g, '/'),
                    id : m[4]
                });
            } else {
                console.log('raro');
            }
        }
        else if (line.trim().startsWith('GlobalSection(NestedProjects)')) {
            isNestedProject = true;
        }
        else if (isNestedProject) {
            var relationRegEx = /(.*)\s*=\s*(.*)/g;
            var m = relationRegEx.exec(line);
            if (m) {
                relations.push({
                    parent: m[2].trim(),
                    child: m[1].trim()
                });
            }
        } else if (isNestedProject && line.trim().startsWith('EndGlobalSection')) {
            isNestedProject = false;
        }
    });

    var temp = []
		projects.forEach(p => {
			var childIndex = relations.findIndex(i => { return i.child == p.id });
			//var parentIndex = relations.findIndex(i => { return i.parent == p.id });
			var itemPath = path.join(workspaceRoot, p.relativePath);
			var folderPath = path.dirname(itemPath);
			
			var item: Item = p.typeId == solutionFolderGuid ?
							 new SolutionFolderItem(p.id, p.name)
							 : new ProjectItem(p.id, p.name, folderPath);
							 
			temp.push({ id: p.id, item: item });
			
			if (childIndex < 0) {
				result.push(item);
			}
		});

		relations.forEach(r => {
			var parentIndex = temp.findIndex(t => { return t.id == r.parent });
			var childIndex = temp.findIndex(t => { return t.id == r.child });
			if (parentIndex < 0 || childIndex < 0) return;
			var parent = temp[parentIndex].item;
			var child = temp[childIndex].item;
			parent.children.push(child);
		});

		return result;
}