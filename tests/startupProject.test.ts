declare const require: (name: string) => any;

const assert = require("assert/strict");
const test = require("node:test");
const path = require("path");
import { compareSolutionItems, isSamePath, isStartupProjectPath } from "../src/core/Solutions/SolutionItemSort";
import { findStartupProjectFromLaunchConfigurations, findStartupProjectFromLaunchSettings, hasProjectLaunchProfile, resolveLaunchPath } from "../src/core/Solutions/StartupProjectResolver";
import type { SolutionItem } from "../src/core/Solutions/model";

type TestItem = SolutionItem & { getFolders?: () => SolutionItem[] };

function createItem(name: string, fullPath: string, displayName: string, isFolder: boolean = false): TestItem {
    const item: TestItem = {
        id: name,
        name,
        fullPath,
        parent: undefined,
        getFullDisplayName: () => displayName
    };

    if (isFolder) {
        item.getFolders = () => [];
    }

    return item;
}

const solutionName = 'MySolution';
const root = process.cwd();
const solutionPath = path.join(root, solutionName + '.sln');

const srcFolder = createItem('src', path.join(root, 'src'), solutionName + path.sep + 'src', true);
const testsFolder = createItem('tests', path.join(root, 'tests'), solutionName + path.sep + 'tests', true);
const entry = createItem('MPAssembleRecipe.Entry', path.join(root, 'src', 'MPAssembleRecipe.Entry', 'MPAssembleRecipe.Entry.csproj'), solutionName + path.sep + 'src' + path.sep + 'MPAssembleRecipe.Entry');
const business = createItem('MPAssembleRecipe.Business', path.join(root, 'src', 'MPAssembleRecipe.Business', 'MPAssembleRecipe.Business.csproj'), solutionName + path.sep + 'src' + path.sep + 'MPAssembleRecipe.Business');

test("isStartupProjectPath recognizes the startup project and its ancestor solution folders", () => {
    assert.equal(isStartupProjectPath(entry, entry), true);
    assert.equal(isStartupProjectPath(srcFolder, entry), true);
    assert.equal(isStartupProjectPath(testsFolder, entry), false);
    assert.equal(isStartupProjectPath(business, entry), false);
});

test("isStartupProjectPath is false when there is no startup project", () => {
    assert.equal(isStartupProjectPath(entry, undefined), false);
});

test("compareSolutionItems moves the startup project above the other projects", () => {
    const projects = [business, entry].sort((a, b) => compareSolutionItems(a, b, entry));

    assert.deepEqual(projects.map(p => p.name), ['MPAssembleRecipe.Entry', 'MPAssembleRecipe.Business']);
});

test("compareSolutionItems moves the solution folder containing the startup project first", () => {
    const folders = [testsFolder, srcFolder].sort((a, b) => compareSolutionItems(a, b, entry));

    assert.deepEqual(folders.map(f => f.name), ['src', 'tests']);
});

test("compareSolutionItems keeps alphabetical order when there is no startup project", () => {
    const projects = [business, entry].sort((a, b) => compareSolutionItems(a, b, undefined));
    const folders = [testsFolder, srcFolder].sort((a, b) => compareSolutionItems(a, b, undefined));

    assert.deepEqual(projects.map(p => p.name), ['MPAssembleRecipe.Business', 'MPAssembleRecipe.Entry']);
    assert.deepEqual(folders.map(f => f.name), ['src', 'tests']);
});

test("isSamePath compares normalized paths and ignores case on Windows", () => {
    assert.equal(isSamePath(solutionPath, solutionPath), true);
    assert.equal(isSamePath(solutionPath, solutionPath + '.other'), false);

    if (process.platform === 'win32') {
        assert.equal(isSamePath(solutionPath, solutionPath.toUpperCase()), true);
    }
});

const resolveWorkspaceFolder = (value: string) => value.replace('${workspaceFolder}', root);
const projectPaths = [entry.fullPath!, business.fullPath!];

test("findProjectFromLaunchConfigurations uses the first configuration that matches a solution project", () => {
    const configurations = [
        { name: 'unrelated', program: '${workspaceFolder}/tools/other.dll' },
        { name: 'business', project: '${workspaceFolder}/src/MPAssembleRecipe.Business/MPAssembleRecipe.Business.csproj' },
        { name: 'entry', project: '${workspaceFolder}/src/MPAssembleRecipe.Entry/MPAssembleRecipe.Entry.csproj' }
    ];

    assert.equal(findStartupProjectFromLaunchConfigurations(configurations, resolveWorkspaceFolder, projectPaths), business.fullPath);
});

test("findProjectFromLaunchConfigurations maps a program path inside bin to its project", () => {
    const program = path.join(root, 'src', 'MPAssembleRecipe.Entry', 'bin', 'Debug', 'net8.0', 'MPAssembleRecipe.Entry.dll');

    assert.equal(findStartupProjectFromLaunchConfigurations([{ program }], value => value, projectPaths), entry.fullPath);
});

test("findProjectFromLaunchConfigurations maps cwd to the project directory", () => {
    const cwd = path.join(root, 'src', 'MPAssembleRecipe.Business');

    assert.equal(findStartupProjectFromLaunchConfigurations([{ cwd }], value => value, projectPaths), business.fullPath);
});

test("findProjectFromLaunchConfigurations prefers the deepest project containing the program", () => {
    const nestedProject = path.join(root, 'src', 'MPAssembleRecipe.Entry', 'Nested', 'Nested.csproj');
    const program = path.join(root, 'src', 'MPAssembleRecipe.Entry', 'Nested', 'bin', 'Debug', 'net8.0', 'Nested.dll');

    assert.equal(findStartupProjectFromLaunchConfigurations([{ program }], value => value, [...projectPaths, nestedProject]), nestedProject);
});

test("findProjectFromLaunchConfigurations skips configurations with unresolved variables", () => {
    const resolve = (value: string) => value.includes('${env:') ? undefined : value;
    const configurations = [
        { program: '${env:APP}/App.dll' },
        { project: path.join(root, 'src', 'MPAssembleRecipe.Entry', 'MPAssembleRecipe.Entry.csproj') }
    ];

    assert.equal(findStartupProjectFromLaunchConfigurations(configurations, resolve, projectPaths), entry.fullPath);
});

test("findProjectFromLaunchConfigurations rejects a configuration when any declared path field is unresolved", () => {
    const resolve = (value: string) => value.includes('${env:') ? undefined : value;
    const cwd = path.join(root, 'src', 'MPAssembleRecipe.Entry');
    const configurations = [
        { program: '${env:APP}/App.dll', cwd },
        { project: path.join(root, 'src', 'MPAssembleRecipe.Business', 'MPAssembleRecipe.Business.csproj') }
    ];

    assert.equal(findStartupProjectFromLaunchConfigurations(configurations, resolve, projectPaths), business.fullPath);
});

test("findProjectFromLaunchConfigurations returns undefined without configurations", () => {
    assert.equal(findStartupProjectFromLaunchConfigurations(undefined, resolveWorkspaceFolder, projectPaths), undefined);
    assert.equal(findStartupProjectFromLaunchConfigurations([], resolveWorkspaceFolder, projectPaths), undefined);
});

test("resolveLaunchPath expands workspace folder variables and relative paths", () => {
    assert.equal(resolveLaunchPath('${workspaceFolder}/src/MPAssembleRecipe.Entry/MPAssembleRecipe.Entry.csproj', root, () => undefined),
        path.resolve(root, 'src', 'MPAssembleRecipe.Entry', 'MPAssembleRecipe.Entry.csproj'));
    assert.equal(resolveLaunchPath('src/MPAssembleRecipe.Entry', root, () => undefined),
        path.resolve(root, 'src', 'MPAssembleRecipe.Entry'));
    assert.equal(resolveLaunchPath('${workspaceFolder:other}/App.csproj', root, name => name === 'other' ? root : undefined),
        path.resolve(root, 'App.csproj'));
});

test("resolveLaunchPath rejects unknown workspace folder variables and other variables", () => {
    assert.equal(resolveLaunchPath('${workspaceFolder:Missing}/App.csproj', root, () => undefined), undefined);
    assert.equal(resolveLaunchPath('${env:APP}/App.dll', root, () => undefined), undefined);
});

test("hasProjectLaunchProfile detects Project profiles", () => {
    assert.equal(hasProjectLaunchProfile({ profiles: { http: { commandName: 'Project' } } }), true);
    assert.equal(hasProjectLaunchProfile({ profiles: { iis: { commandName: 'IISExpress' } } }), false);
    assert.equal(hasProjectLaunchProfile({ profiles: {} }), false);
    assert.equal(hasProjectLaunchProfile(undefined), false);
});

test("findStartupProjectFromLaunchSettings uses the first project with a Project profile", () => {
    const entries = [
        { projectPath: entry.fullPath!, launchSettings: { profiles: { iis: { commandName: 'IISExpress' } } } },
        { projectPath: business.fullPath!, launchSettings: { profiles: { http: { commandName: 'Project' } } } }
    ];

    assert.equal(findStartupProjectFromLaunchSettings(entries), business.fullPath);
    assert.equal(findStartupProjectFromLaunchSettings([]), undefined);
});
