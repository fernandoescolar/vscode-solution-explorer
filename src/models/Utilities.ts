import * as path from 'path';
import * as fs from 'fs';
import * as ItemFactory from './ItemFactory'
import Item from '../items/Item';
import SolutionLine from './SolutionLine';
import ProjectInfo from './ProjectInfo';
import PackageInfo from './PackageInfo';

export function getDirectorySolutions(dirPath: string): Item[] {
    var solutions = searchFilesInDir(dirPath, '.sln', false);
    var result: Item[] = [];
    
    solutions.forEach(s => {
        result.push(ItemFactory.createSolutionItem(s));
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
                searchFilesInDir(filename, extension, recursive).forEach(i => result.push(i)); 
        }
        else if (filename.endsWith(extension)) {
            result.push(filename);
        }
    }

    return result;
}

export function parseSolution(solutionPath: string) : Item[] {
    var result: Item[] = [];
    var workspaceRoot = path.dirname(solutionPath);
    var lines = fs.readFileSync(solutionPath, 'utf8').split('\n');
    var projects: SolutionLine[] = [], relations = [], isNestedProject = false;

    lines.forEach(line => {
        if (line.trim().startsWith('Project(')) {
            var projectRegEx = /Project\("(.*)"\)\s*=\s*"(.*)"\s*,\s*"(.*)"\s*,\s*"(.*)"/g;
            var m = projectRegEx.exec(line);
            if (m) {
                projects.push(new SolutionLine(
                    m[1],
                    m[2],
                    path.join(workspaceRoot, m[3].replace(/\\/g, '/')),
                    m[4]
                ));
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

    var temp = [];
    projects.forEach(p => {
        var childIndex = relations.findIndex(i => { return i.child == p.id });
        //var parentIndex = relations.findIndex(i => { return i.parent == p.id });
        var item: Item = ItemFactory.createSolutionChildItem(p);
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

export function getDirectoryItems (dirPath: string): Item[] {
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

    directories.sort((a, b) => {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    
    files.sort((a, b) => {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    directories.forEach(i => {
        var folderPath = path.join(dirPath, i);
        result.push(ItemFactory.createFolderItem(i, folderPath));
    });

    files.forEach(i => {
        var filePath = path.join(dirPath, i);
        result.push(ItemFactory.createFileItem(i, filePath));
    });

    return result;
}

export function parseCspCsProject(projectPath: string): ProjectInfo {
    var result = new ProjectInfo(projectPath);
    var content = fs.readFileSync(projectPath, 'utf8');
    var packageRegEx = /<PackageReference\s+Include=\"(.*)\"\s+Version=\"(.*)\"/g;
    var projectRegEx = /<ProjectReference\s+Include=\"(.*)\"/g;
    var m;
    
    while ((m = packageRegEx.exec(content)) !== null) {
        result.packages.push(new PackageInfo(m[1], m[2]));
    }

    while ((m = projectRegEx.exec(content)) !== null) {
        result.references.push(m[1]);
    }

    return result;
}
