import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as xml from "@extensions/xml";
import { XmlElement } from "@extensions/xml";
import * as config from "@extensions/config";
import * as msBuildPropertyOverrides from "@extensions/msBuildPropertyOverrides";
import { Include, ItemGroup, PackageReference, PackageVersion, ProjectItem, ProjectItemsFactory, PropertyGroup } from "../Items";
import * as ConditionEvaluator from "../ConditionEvaluator";
import { ProjectFileStat } from "../ProjectFileStat";
import { Manager } from "./Manager";
import { Direction, RelativeFilePosition } from "../RelativeFilePosition";
import { NugetDependencies } from "@extensions/nuget-dependencies";

interface NamedHierarchy<T> {
    groupName: string;
    item: T | undefined;
    children: NamedHierarchy<T>[]
}

export class XmlManager implements Manager {
    private readonly projectFolderPath: string;
    private document: XmlElement | undefined;
    private projectItems: ProjectItem[] = [];
    private itemGroups: ItemGroup[] = [];
    private propertyGroups: PropertyGroup[] = [];
    private externalFiles: string[] = [];
    private properties: Record<string, string> = {};
    private currentItemGroup: xml.XmlElement | undefined = undefined;
    private _sdk: string | undefined;
    private _toolsVersion: string | undefined;

    constructor(private readonly fullPath: string, private readonly includePrefix?: string, private readonly solutionFullPath?: string) {
        this.projectFolderPath = path.dirname(fullPath);
    }

    public get isCps(): boolean {
        return !!this._sdk;
    }

    public get sdk(): string | undefined {
        return this._sdk;
    }

    public get toolsVersion(): string | undefined {
        return this._toolsVersion;
    }

    public get isFSharp(): boolean {
        return this.fullPath.toLocaleLowerCase().endsWith(".fsproj");
    }

    public async createFile(folderpath: string, filename: string, content?: string, relativePosition?: RelativeFilePosition): Promise<string> {
        await this.ensureIsLoaded();

        const folderRelativePath = this.getRelativePath(folderpath);
        const relativePath = path.join(folderRelativePath, filename);
        const extension = path.extname(relativePath)?.substring(1);
        const itemTypes = config.getItemTypes();
        let type = 'None';
        if (itemTypes[extension]) {
            type = itemTypes[extension];
        } else {
            type = itemTypes['*'];
        }

        if (!type) {
            type = 'None';
        }

        if (folderRelativePath) {
            // maybe the folder was empty
            this.removeInNodes(folderRelativePath, true, ['Folder']);
        }

        const fullPath = path.join(this.projectFolderPath, relativePath);
        if (!this.isCurrentlyIncluded(fullPath)) {
            this.currentItemGroupAdd(type, relativePath, undefined, relativePosition);
        }

        await this.saveProject();
        return relativePath;
    }

    public async createFolder(folderpath: string): Promise<string> {
        await this.ensureIsLoaded();

        let folderRelativePath = this.getRelativePath(folderpath);
        let parentRelativePath = path.dirname(folderRelativePath);
        if (parentRelativePath) {
            // maybe the container folder was empty
            this.removeInNodes(parentRelativePath, true, ['Folder']);
        }

        const fullPath = path.join(this.projectFolderPath, folderRelativePath);
        if (!this.isCurrentlyIncluded(fullPath) && folderRelativePath) {
            this.currentItemGroupAdd('Folder', folderRelativePath, true);
        }

        await this.saveProject();
        return folderRelativePath;
    }

    public async deleteFile(filepath: string): Promise<void> {
        await this.ensureIsLoaded();

        const relativePath = this.getRelativePath(filepath);
        const folderRelativePath = path.dirname(relativePath);
        this.removeInNodes(relativePath);
        if (folderRelativePath !== '.' && this.countInNodes(folderRelativePath, true) === 0) {
            const folderFullPath = path.dirname(filepath);
            if (!this.isCurrentlyIncluded(folderFullPath)) {
                this.currentItemGroupAdd('Folder', folderRelativePath, true);
            }
        }

        await this.saveProject();
    }

    public async deleteFolder(folderpath: string): Promise<void> {
        await this.ensureIsLoaded();

        const folderRelativePath = this.getRelativePath(folderpath);
        this.removeInNodes(folderRelativePath, true);
        await this.saveProject();
    }

    public async moveFile(filepath: string, newfolderPath: string): Promise<string> {
        await this.ensureIsLoaded();

        const filename = path.basename(filepath);
        const relativePath = this.getRelativePath(filepath);
        const relativeFolderPath = path.dirname(relativePath);
        const countInNodes = this.countInNodes(relativeFolderPath);

        const newRelativePath = path.join(newfolderPath, filename);
        const newRelativeFolderPath = path.dirname(newRelativePath);

        this.renameInNodes(relativePath, newRelativePath);

        if (newRelativeFolderPath && newRelativeFolderPath !== '.') {
            this.removeInNodes(newRelativeFolderPath, true, ['Folder']);
        }

        const newCountInNodes = this.countInNodes(relativeFolderPath);
        if (countInNodes === 1 && newCountInNodes === 0) {
            this.currentItemGroupAdd('Folder', relativeFolderPath, true);
        }

        await this.saveProject();
        return newRelativePath;
    }


    private collectProjectItems<T>(project: xml.XmlElement, map: (group: xml.XmlElement, item: xml.XmlElement, itemIndex: number, groupIndex: number) => T | undefined): T[] {
        const collected: T[] = [];
        this.someProjectItem(project, (itemGroup, item, itemIndex, groupIndex) => {
            const mapped = map(itemGroup, item, itemIndex, groupIndex)
            if (mapped) {
                collected.push(mapped)
            }
            return false;
        });
        return collected;
    }

    private groupBy<T>(array: T[], groupf: (item: T) => string): Record<string, T[]> {
        const dict: Record<string, T[]> = {}
        array.forEach(item => {
            const key = groupf(item)
            if (!dict[key]) {
                dict[key] = [];
            }
            dict[key].push(item);
        })
        return dict;
    }

    private partition<T>(array: T[], testf: (item: T) => boolean): [passed: T[], failed: T[]] {
        const passed: T[] = [];
        const failed: T[] = []

        array.forEach(x => {
            if (testf(x)) {
                passed.push(x);
            }
            else failed.push(x);
        });

        return [passed, failed];
    }

    private pathSegments(_path: string): string[] {
        return _path.split(path.sep);
    }
    private buildHierarchyFromName<T>(items: T[], nameSegmentsf: (item: T) => string[]): NamedHierarchy<T>[] {
        const withRelativePath = items.map(x => ({
            relativeSegments: nameSegmentsf(x),
            item: x
        }))
            .filter(x => x.relativeSegments && x.relativeSegments.length > 0);

        const recurse = (withRelativePaths: { relativeSegments: string[]; item: T }[]): NamedHierarchy<T>[] => {
            const groups = this.groupBy(withRelativePaths, (x) => x.relativeSegments[0]);

            return Object.keys(groups)
                .map((group: string) => {
                    const groupItems = groups[group];
                    const [pathIsExactlyGroup, children] = this.partition(groupItems, (x) => x.relativeSegments.length === 1);

                    const popTopSegment = (x: { relativeSegments: string[]; item: T }) => {
                        x.relativeSegments = x.relativeSegments.slice(1)
                        return x;
                    }

                    const groupNode: NamedHierarchy<T> = {
                        groupName: group,
                        item: undefined,
                        children: children.length > 0 ? recurse(children.map(popTopSegment)) : []
                    }

                    if (pathIsExactlyGroup.length > 0) {
                        groupNode.item = pathIsExactlyGroup[0].item;
                    }
                    return groupNode;
                });
        }
        return recurse(withRelativePath);
    }

    private buildProjectItemHierarchy(project: xml.XmlElement) {

        const qualifingProjectItems =
            this.collectProjectItems(project, (itemGroup, element, index, groupIndex) => {
                if (element.attributes && element.attributes.Include) {

                    return {
                        itemGroup: itemGroup,
                        groupIndex: groupIndex,
                        itemIndexInGroup: index,
                        path: element.attributes.Include.toLocaleLowerCase(),
                        element: element
                    };
                }
                else {
                    return undefined;
                }
            });
        return this.buildHierarchyFromName(qualifingProjectItems, x => this.pathSegments(x.path));
    }

    private getPeerCollection<T>(path: string, hierarchy: NamedHierarchy<T>[]) {
        const recurse = (relativeSegments: string[], toSearch: NamedHierarchy<T>[]): NamedHierarchy<T>[] => {
            if (relativeSegments.length > 1) {
                const found = toSearch.find((x) => x.groupName === relativeSegments[0]);
                if (!found) return [];
                else return recurse(relativeSegments.slice(1), found.children);
            }
            else {
                return toSearch;
            }
        }
        return recurse(this.pathSegments(path), hierarchy);
    }

    private getHierarchyLeafs<T>(hierarchy: NamedHierarchy<T>): T[] {
        const recurse = (hierarchy: NamedHierarchy<T>): T[] => {
            const leafs = hierarchy.item ? [hierarchy.item] : []
            const childLeafs = hierarchy.children.flatMap(x => recurse(x))

            return [...leafs, ...childLeafs];
        }
        return recurse(hierarchy);
    }

    private orderProjectItems(projectItems: { groupIndex: number, itemIndexInGroup: number, itemGroup: XmlElement, element: XmlElement }[]) {
        return projectItems.sort((left, right) => {
            if (left.groupIndex != right.groupIndex) return left.groupIndex < right.groupIndex ? -1 : 1;
            else if (left.itemIndexInGroup != right.itemIndexInGroup) return left.groupIndex < right.groupIndex ? -1 : 1;
            else return 0;
        })
    }

    public async moveFileUp(filepath: string): Promise<string> {
        await this.ensureIsLoaded();
        const relativePath = this.getRelativePath(filepath);
        if (!this.document) { return filepath; }

        const project = XmlManager.getProjectElement(this.document);
        if (!project) { return filepath; }

        const peers = this.getPeerCollection(relativePath, this.buildProjectItemHierarchy(project));
        const groupToMove_IndexInPeers = peers.findIndex(pi => pi.groupName === path.basename(relativePath).toLocaleLowerCase());
        const groupToMove = groupToMove_IndexInPeers !== -1 ? peers[groupToMove_IndexInPeers] : undefined;

        if (groupToMove && groupToMove_IndexInPeers > 0) {
            const groupAbove = peers[groupToMove_IndexInPeers - 1];
            const topItemInGroupAbove = this.orderProjectItems(this.getHierarchyLeafs(groupAbove))[0]
            const itemsToMove = this.orderProjectItems(this.getHierarchyLeafs(groupToMove));

            const elementFinder = (toFind: XmlElement) => ((other: XmlElement) => toFind.attributes.Include === other.attributes.Include);
            // remove items from their previous positions
            itemsToMove.forEach((toMove) => {
                // IMPORTANT: we can't use the index on the leaf item because the indexes change as we update the project file
                let deleteIndex = toMove.itemGroup.elements.findIndex(elementFinder(toMove.element));
                toMove.itemGroup.elements.splice(deleteIndex, 1);
            });
            // insert to new location
            let insertBaseIndex = topItemInGroupAbove.itemGroup.elements.findIndex(elementFinder(topItemInGroupAbove.element));
            itemsToMove.forEach((toMove, i) => {
                topItemInGroupAbove.itemGroup.elements.splice(insertBaseIndex + i, 0, toMove.element);
            })
        }

        await this.saveProject();
        return filepath;
    }

    public async moveFileDown(filepath: string): Promise<string> {
        await this.ensureIsLoaded();
        const relativePath = this.getRelativePath(filepath);
        const nodeNames = this.getXmlNodeNames();
        if (!this.document) { return filepath; }

        const project = XmlManager.getProjectElement(this.document);
        if (!project) { return filepath; }

        const peers = this.getPeerCollection(relativePath, this.buildProjectItemHierarchy(project));
        const groupToMove_IndexInPeers = peers.findIndex(pi => pi.groupName === path.basename(relativePath).toLocaleLowerCase());
        const groupToMove = groupToMove_IndexInPeers !== -1 ? peers[groupToMove_IndexInPeers] : undefined;

        if (groupToMove && groupToMove_IndexInPeers < (peers.length - 1)) {
            const groupBelow = peers[groupToMove_IndexInPeers + 1];
            const itemsInGroupBelow = this.orderProjectItems(this.getHierarchyLeafs(groupBelow));
            const bottomItemInGroupBelow = itemsInGroupBelow[itemsInGroupBelow.length - 1];
            const itemsToMove = this.orderProjectItems(this.getHierarchyLeafs(groupToMove));

            const elementFinder = (toFind: XmlElement) => ((other: XmlElement) => toFind.attributes.Include === other.attributes.Include);
            // remove items from their previous positions
            itemsToMove.forEach((toMove) => {
                // IMPORTANT: we can't use the index on the leaf item because the indexes change as we update the project file
                let deleteIndex = toMove.itemGroup.elements.findIndex(elementFinder(toMove.element))
                toMove.itemGroup.elements.splice(deleteIndex, 1);
            });
            // insert to new location
            let insertBaseIndex = bottomItemInGroupBelow.itemGroup.elements.findIndex(elementFinder(bottomItemInGroupBelow.element));
            if (insertBaseIndex === bottomItemInGroupBelow.itemGroup.elements.length) {
                itemsToMove.forEach(bottomItemInGroupBelow.itemGroup.elements.push);
            }
            else {
                itemsToMove.forEach((toMove, i) => {
                    bottomItemInGroupBelow.itemGroup.elements.splice(insertBaseIndex + i + 1, 0, toMove.element);
                });
            }
        }

        await this.saveProject();
        return filepath;
    }

    public async moveFolder(folderpath: string, newfolderPath: string): Promise<string> {
        await this.ensureIsLoaded();

        const foldername = path.basename(folderpath);
        const relativePath = this.getRelativePath(folderpath);
        const newRelativePath = path.join(newfolderPath, foldername);
        const newRelativeFolderPath = path.dirname(newRelativePath);

        if (newRelativeFolderPath && newRelativeFolderPath !== '.') {
            this.removeInNodes(newRelativeFolderPath, true, ['Folder']);
        }

        this.renameInNodes(relativePath, newRelativePath, true);
        await this.saveProject();
        return newRelativePath;
    }

    public async renameFile(filepath: string, name: string): Promise<string> {
        await this.ensureIsLoaded();

        const relativePath = this.getRelativePath(filepath);
        const newRelativePath = path.join(path.dirname(relativePath), name);
        this.renameInNodes(relativePath, newRelativePath);
        await this.saveProject();
        return newRelativePath;
    }

    public async renameFolder(folderpath: string, name: string): Promise<string> {
        await this.ensureIsLoaded();

        const relativePath = this.getRelativePath(folderpath);
        const newRelativePath = path.join(path.dirname(relativePath), name);
        this.renameInNodes(relativePath, newRelativePath, true);
        await this.saveProject();
        return newRelativePath;
    }

    public statFile(filepath: string, folderPath: string): Promise<ProjectFileStat> {
        throw new Error("Method not implemented.");
    }

    public async refresh(): Promise<void> {
        const content = await fs.readFile(this.fullPath);
        this.document = await xml.parseToJson(content);
        this.projectItems = await this.parseDocument();
    }

    public async updatePackageReference(packages: NugetDependencies): Promise<void> {
        this.projectItems.forEach(pi => {
            if (pi instanceof PackageReference && !pi.version && packages[pi.name.toLowerCase()]) {
                pi.version = packages[pi.name.toLowerCase()].version;
            }
        });
    }

    public async getProjectItems(): Promise<ProjectItem[]> {
        await this.ensureIsLoaded();
        return this.projectItems;
    }

    public async getItemGroups(): Promise<ItemGroup[]> {
        await this.ensureIsLoaded();
        return this.itemGroups;
    }

    public async getPropertyGroups(): Promise<PropertyGroup[]> {
        await this.ensureIsLoaded();
        return this.propertyGroups;
    }

    // full paths of every .props/.targets file this project pulled in while
    // evaluating (explicit <Import>s, plus auto-discovered Directory.Build.*
    // and Directory.Packages.props) - used to know when a change to one of
    // them should trigger a reload of this project, even though the file
    // itself lives outside the project's own directory.
    public async getExternalFiles(): Promise<string[]> {
        await this.ensureIsLoaded();
        return this.externalFiles;
    }

    // the fully evaluated property bag as it stood at the end of parsing: values
    // explicitly set in the project's own/imported PropertyGroups (Condition-aware,
    // last unconditioned or matching-condition value wins) plus reserved MSBuild
    // properties seeded up front (MSBuildProjectName, TargetFramework derived from
    // TargetFrameworks, Configuration/Platform defaults, etc.)
    public async getProperties(): Promise<Record<string, string>> {
        await this.ensureIsLoaded();
        return { ...this.properties };
    }

    public async tryReplaceLinkFolderName(relativePath: string, oldName: string, newName: string): Promise<boolean> {
        await this.ensureIsLoaded();
        if (!this.document) { return false; }

        let result = false;
        const nodeNames = this.getXmlNodeNames();
        const project = XmlManager.getProjectElement(this.document);
        if (!project) { return false; }

        const replaceAttribute = (node: xml.XmlElement, attributeName: string, oldValue: string, newValue: string): boolean => {
            if (node.attributes && node.attributes[attributeName]) {
                const values = node.attributes[attributeName].split("\\");
                const index = values.indexOf(oldValue);
                if (index >= 0) {
                    values[index] = newValue;
                    node.attributes[attributeName] = values.join("\\");
                    return true;
                }
            }

            return false;
        };

        const replaceElementText = (node: xml.XmlElement, nodeName: string, oldValue: string, newValue: string): boolean => {
            const linkElement = node.elements?.find((e: XmlElement) => e.name === nodeName);
            if (linkElement) {
                const value = linkElement.elements[0].text;
                if (value) {
                    const values = value.split("\\");
                    const index = values.indexOf(oldValue);
                    if (index >= 0) {
                        values[index] = newValue;
                        linkElement.elements[0].text = values.join("\\");
                        return true;
                    }
                }
            }

            return false;
        };

        project.elements.forEach((element: xml.XmlElement) => {
            if (element.name === 'ItemGroup') {
                if (!element.elements || !Array.isArray(element.elements)) {
                    element.elements = [];
                }

                element.elements.forEach((e: xml.XmlElement) => {
                    nodeNames.forEach(nodeName => {
                        if (e.name === nodeName) {
                            if (replaceAttribute(e, 'LinkBase', oldName, newName)
                                || replaceElementText(e, 'LinkBase', oldName, newName)
                                || replaceAttribute(e, 'Link', oldName, newName)
                                || replaceElementText(e, 'Link', oldName, newName)) {
                                result = true;
                            }
                        }
                    });
                });
            }
        });

        if (result) {
            await this.saveProject();
        }

        return result;
    }

    private countInNodes(pattern: string, isFolder: boolean = false): number {
        if (!this.document) { return 0; }

        pattern = pattern.replace(/\//g, '\\') + (isFolder ? '\\' : '');
        if (this.includePrefix) { pattern = this.includePrefix + pattern; }

        let counter = 0;
        const findPattern = (ref: xml.XmlElement) => {
            if (ref.attributes && ref.attributes.Include && ref.attributes.Include.startsWith(pattern)) {
                counter++;
            }
        };

        const nodeNames = this.getXmlNodeNames();
        const project = XmlManager.getProjectElement(this.document);
        if (!project) { return 0; }

        project.elements.forEach((element: xml.XmlElement) => {
            if (element.name === 'ItemGroup') {
                if (!element.elements || !Array.isArray(element.elements)) {
                    element.elements = [];
                }

                element.elements.forEach((e: xml.XmlElement) => {
                    nodeNames.forEach(nodeName => {
                        if (e.name === nodeName) {
                            findPattern(e);
                        }
                    });
                });
            }
        });

        return counter;
    }

    private renameInNodes(pattern: string, newPattern: string, isFolder: boolean = false): void {
        if (!this.document) { return; }

        pattern = pattern.replace(/\//g, '\\') + (isFolder ? '\\' : '');
        newPattern = newPattern.replace(/\//g, '\\') + (isFolder ? '\\' : '');

        if (this.includePrefix) {
            pattern = this.includePrefix + pattern;
            newPattern = this.includePrefix + newPattern;
        }

        let findPattern = (ref: xml.XmlElement) => {
            this.replaceDependsUponNode(ref, pattern, newPattern);

            if (ref.attributes.Include && ref.attributes.Include.startsWith(pattern)) {
                ref.attributes.Include = ref.attributes.Include.replace(pattern, newPattern);
            }
        };

        let nodeNames = this.getXmlNodeNames();
        let project = XmlManager.getProjectElement(this.document);
        if (!project) { return; }

        project.elements.forEach((element: xml.XmlElement) => {
            if (element.name === 'ItemGroup') {
                if (!element.elements || !Array.isArray(element.elements)) {
                    element.elements = [];
                }

                element.elements.forEach((e: xml.XmlElement) => {
                    nodeNames.forEach(nodeName => {
                        if (e.name === nodeName) {
                            findPattern(e);
                        }
                    });
                });
            }
        });
    }

    protected replaceDependsUponNode(ref: xml.XmlElement, pattern: string, newPattern: string) {
        if (!ref.elements) { return; }

        ref.elements.forEach((e: xml.XmlElement) => {
            if (e.name === 'DependentUpon' && e.elements[0].text.startsWith(pattern)) {
                e.elements[0].text = e.elements[0].text.replace(pattern, newPattern);
            }
        });
    }

    private removeInNodes(pattern: string, isFolder: boolean = false, types: string[] | null = null): void {
        if (!this.document) { return; }

        pattern = pattern.replace(/\//g, '\\') + (isFolder ? '\\' : '');
        if (this.includePrefix) {
            pattern = this.includePrefix + pattern;
        }

        if (!types) {
            types = this.getXmlNodeNames();
        }

        const project = XmlManager.getProjectElement(this.document);
        if (!project) { return; }

        project.elements.forEach((element: xml.XmlElement, elementIndex: number) => {
            if (element.name === 'ItemGroup') {
                XmlManager.ensureElements(element);
                const toDelete: xml.XmlElement[] = [];
                element.elements.forEach((e: xml.XmlElement) => {
                    if (types === null) { return; }
                    types.forEach(nodeName => {
                        if (e.name === nodeName) {
                            this.deleteDependsUponNode(e, pattern);
                            if (e.attributes.Include && e.attributes.Include.startsWith(pattern)) {
                                toDelete.push(e);
                            }

                            if (e.attributes.Remove && e.attributes.Remove.startsWith(pattern)) {
                                toDelete.push(e);
                            }

                            if (e.attributes.Update && e.attributes.Update.startsWith(pattern)) {
                                toDelete.push(e);
                            }
                        }
                    });
                });

                toDelete.forEach(e => {
                    element.elements.splice(element.elements.indexOf(e), 1);
                });


                if (element.elements.length === 0) {
                    project.elements.splice(elementIndex, 1);
                }
            }
        });
    }

    protected deleteDependsUponNode(node: xml.XmlElement, pattern: string) {
        if (!node.elements) { return; }

        node.elements.forEach((e: xml.XmlElement, eIndex: number) => {
            if (e.name === 'DependentUpon' && e.elements[0].text.startsWith(pattern)) {
                node.elements.splice(eIndex, 1);
            }
        });

        if (node.elements.length === 0) {
            delete node.elements;
        }
    }

    private someProjectItem(project: xml.XmlElement, test: (group: xml.XmlElement, item: xml.XmlElement, index: number, groupIndex: number) => Boolean): xml.XmlElement | undefined {
        const nodeNames = this.getXmlNodeNames();
        const isValidElement = (e: xml.XmlElement) => nodeNames.length === 0 || nodeNames.indexOf(e.name) > -1;

        for (let groupIndex = 0; groupIndex < project.elements.length; groupIndex++) {
            const maybeGroup = project.elements[groupIndex];
            if (maybeGroup.name === 'ItemGroup' && maybeGroup.elements && Array.isArray(maybeGroup.elements)) {
                const curried = (item: xml.XmlElement, itemIndex: number): Boolean => isValidElement(item) ? test(maybeGroup, item, itemIndex, groupIndex) : false
                const item = maybeGroup.elements.some(curried);
                if (item) {
                    return item;
                }
            }
        }
    }

    private currentItemGroupAdd(type: string, include: string, isFolder: boolean = false, relativePosition?: RelativeFilePosition): void {
        const itemGroup = this.checkCurrentItemGroup();
        if (!itemGroup) { return; }

        include = include.replace(/\//g, '\\') + (isFolder ? '\\' : '');

        if (this.includePrefix) {
            include = this.includePrefix + include;
        }

        if (type === 'Folder' && include === '\\') {
            return;
        }

        const newItemElement = {
            type: 'element',
            name: type,
            attributes: {
                ["Include"]: include
            }
        }

        if (relativePosition) {
            if (!this.document) return;
            const project = XmlManager.getProjectElement(this.document);
            if (!project) { return; }

            const lowercaseTargetFilePath = this.getRelativePath(relativePosition.fullpath).toLocaleLowerCase();

            this.someProjectItem(project, (itemGroup, e, index) => {
                if (e.attributes && e.attributes.Include && e.attributes.Include.toLocaleLowerCase() === lowercaseTargetFilePath) {
                    if (index >= 0) {
                        const indexOffset = relativePosition.direction === Direction.Above ? 0 : 1;
                        itemGroup.elements.splice(index + indexOffset, 0, newItemElement);
                    }

                    return true;
                }

                return false;
            });
        }
        else {
            itemGroup.elements.push(newItemElement);
        }
    }

    private checkCurrentItemGroup(): XmlElement | undefined {
        if (!this.document) { return; }

        const project = XmlManager.getProjectElement(this.document);
        if (!project) { return; }

        let current: xml.XmlElement | undefined;
        let lastElement: xml.XmlElement | undefined;
        project.elements.forEach((element: xml.XmlElement) => {
            if (element.name === 'ItemGroup') {
                lastElement = element;
            }
            if (this.currentItemGroup && element === this.currentItemGroup) {
                current = element;
            }
        });

        if (!current && !lastElement) {
            current = {
                type: 'element',
                name: 'ItemGroup',
                elements: []
            };
            project.elements.push(current);
        } else if (!current) {
            current = lastElement;
        }

        this.currentItemGroup = current;
        return current;
    }

    private async ensureIsLoaded(): Promise<void> {
        if (!this.document) {
            await this.refresh();
        }
    }

    private async parseDocument(): Promise<ProjectItem[]> {
        if (!this.document) { return []; }

        const project = XmlManager.getProjectElement(this.document);
        if (!project) { return []; }

        const result: ProjectItem[] = [];
        if ((this._sdk = project.attributes && project.attributes.Sdk) && !this.isFSharp) {
            const exclude = [...config.getNetCoreIgnore(), this.fullPath].join(";");
            const allFolders = new Include("Compile", "**/*", undefined, undefined, exclude);
            result.push(allFolders);
        }

        this._toolsVersion = project.attributes && project.attributes.ToolsVersion;

        this.propertyGroups = [];
        this.itemGroups = [];
        this.externalFiles = [];

        const properties: Record<string, string> = this.createBuiltInProperties();
        if (this.includePrefix?.startsWith("$(") && this.includePrefix?.endsWith(")")) {
            const propertyName = this.includePrefix.substring(2, this.includePrefix.length - 1);
            properties[propertyName] = "";
        }

        // a file never auto-imports itself (relevant when this XmlManager IS a
        // Directory.Build.props/Directory.Packages.props being read directly)
        const importedFiles = new Set<string>([this.fullPath.toLocaleLowerCase()]);

        const buildProps = await this.findAncestorFile(this.projectFolderPath, XmlManager.DIRECTORY_BUILD_PROPS);
        if (buildProps) {
            await this.importFile(buildProps, properties, result, importedFiles, 0);
        }

        const packagesProps = await this.findAncestorFile(this.projectFolderPath, XmlManager.DIRECTORY_PACKAGES_PROPS);
        if (packagesProps) {
            await this.importFile(packagesProps, properties, result, importedFiles, 0);
        }

        await this.processElements(project.elements, this.projectFolderPath, properties, result, importedFiles, 0);

        const buildTargets = await this.findAncestorFile(this.projectFolderPath, XmlManager.DIRECTORY_BUILD_TARGETS);
        if (buildTargets) {
            await this.importFile(buildTargets, properties, result, importedFiles, 0);
        }

        this.resolveCentralPackageVersions(result, properties);
        this.properties = properties;

        return result;
    }

    private static readonly DIRECTORY_BUILD_PROPS = "Directory.Build.props";
    private static readonly DIRECTORY_BUILD_TARGETS = "Directory.Build.targets";
    private static readonly DIRECTORY_PACKAGES_PROPS = "Directory.Packages.props";

    // walks up from startDir to the filesystem root looking for fileName,
    // matching MSBuild's implicit Directory.Build.*/Directory.Packages.props discovery
    private async findAncestorFile(startDir: string, fileName: string): Promise<string | undefined> {
        let dir = startDir;
        while (true) {
            const candidate = path.join(dir, fileName);
            if (await fs.exists(candidate)) { return candidate; }

            const parent = path.dirname(dir);
            if (parent === dir) { return undefined; }
            dir = parent;
        }
    }

    private resolveCentralPackageVersions(result: ProjectItem[], properties: Record<string, string>): void {
        if ((properties['ManagePackageVersionsCentrally'] ?? '').toLocaleLowerCase() === 'false') { return; }

        const versions = new Map<string, string>();
        result.forEach(item => {
            if (item instanceof PackageVersion) {
                versions.set(item.name.toLocaleLowerCase(), item.version);
            }
        });

        if (versions.size === 0) { return; }

        result.forEach(item => {
            if (item instanceof PackageReference && !item.hasVersion()) {
                const version = versions.get(item.name.toLocaleLowerCase());
                if (version) { item.updateVersion(version); }
            }
        });
    }

    private createBuiltInProperties(): Record<string, string> {
        const extension = path.extname(this.fullPath);
        const name = path.basename(this.fullPath, extension);
        const root = path.parse(this.projectFolderPath).root;
        const directoryNoRoot = this.projectFolderPath.startsWith(root)
            ? this.projectFolderPath.substring(root.length)
            : this.projectFolderPath;

        const properties: Record<string, string> = {
            MSBuildProjectDirectory: this.projectFolderPath,
            MSBuildProjectDirectoryNoRoot: directoryNoRoot,
            MSBuildProjectFullPath: this.fullPath,
            MSBuildProjectFile: name + extension,
            MSBuildProjectName: name,
            MSBuildProjectExtension: extension,
            MSBuildThisFileDirectory: this.projectFolderPath + path.sep,
            MSBuildVersion: config.getDefaultMsBuildVersion(),
            Configuration: config.getDefaultMsBuildConfiguration(),
            Platform: config.getDefaultMsBuildPlatform(),
        };

        // user-configured overrides (via the "Edit MSBuild Properties" command) win over
        // the extension-wide settings above; project-level overrides win over solution-level
        Object.assign(properties, msBuildPropertyOverrides.getEffectiveOverrides(this.fullPath, this.solutionFullPath));

        return properties;
    }

    private substituteProperties(value: string, properties: Record<string, string>): string {
        Object.entries(properties).forEach(([k, v]) => value = value.replaceAll(`$(${k})`, v));
        return value;
    }

    private async processElements(elements: XmlElement[], baseDir: string, properties: Record<string, string>, result: ProjectItem[], importedFiles: Set<string>, depth: number): Promise<void> {
        for (const element of elements) {
            if (element.name === 'PropertyGroup') {
                if (!(await ConditionEvaluator.evaluate(element.attributes?.Condition, properties, baseDir))) {
                    continue;
                }

                const pg = new PropertyGroup({});
                XmlManager.ensureElements(element);
                for (const e of element.elements) {
                    if (!(await ConditionEvaluator.evaluate(e.attributes?.Condition, properties, baseDir))) {
                        continue;
                    }

                    let value = e.elements?.find((el: XmlElement) => el.type == "text")?.text ?? "";
                    value = this.substituteProperties(value, properties);
                    properties[e.name] = value;
                    pg.items[e.name] = value;

                    // multi-targeted projects only set TargetFrameworks (plural); MSBuild
                    // evaluates once per TFM, but this reader is single-pass, so fall back
                    // to the first one so $(TargetFramework) conditions still resolve
                    if (e.name === 'TargetFrameworks' && !properties['TargetFramework']) {
                        const firstFramework = value.split(';').map((v: string) => v.trim()).find((v: string) => v.length > 0);
                        if (firstFramework) { properties['TargetFramework'] = firstFramework; }
                    }
                }
                this.propertyGroups.push(pg);
            }
            else if (element.name === 'ItemGroup') {
                if (!(await ConditionEvaluator.evaluate(element.attributes?.Condition, properties, baseDir))) {
                    continue;
                }

                XmlManager.ensureElements(element);
                const label = element.attributes?.Label ?? undefined;
                const condition = element.attributes?.Condition ?? undefined;

                const currentItemGroups = this.itemGroups?.filter(ig => ig.label === label && ig.condition == condition);
                let itemGroup: ItemGroup;
                if (currentItemGroups.length > 0)
                    itemGroup = currentItemGroups[0];
                else {
                    itemGroup = new ItemGroup("ItemGroup", condition, label);
                    this.itemGroups.push(itemGroup);
                }

                for (const e of element.elements) {
                    const projectItem = await ProjectItemsFactory.createProjectElement(e, properties, baseDir);
                    if (!projectItem) {
                        continue;
                    }
                    if (projectItem instanceof PackageReference)
                        itemGroup.packageReferences.push(projectItem);
                    if (projectItem instanceof PackageVersion)
                        itemGroup.packageVersions.push(projectItem);

                    result.push(projectItem);
                }
            }
            else if (element.name === 'Import') {
                await this.processImport(element, baseDir, properties, result, importedFiles, depth);
            }
        }
    }

    private async processImport(element: XmlElement, baseDir: string, properties: Record<string, string>, result: ProjectItem[], importedFiles: Set<string>, depth: number): Promise<void> {
        if (depth >= 10) { return; }
        if (!(await ConditionEvaluator.evaluate(element.attributes?.Condition, properties, baseDir))) {
            return;
        }

        const projectAttribute = element.attributes?.Project;
        if (!projectAttribute) { return; }

        const importPaths = this.substituteProperties(projectAttribute, properties).split(';');
        for (const importPath of importPaths) {
            const trimmed = importPath.trim();
            if (!trimmed) { continue; }

            const resolvedPath = path.resolve(baseDir, trimmed);
            await this.importFile(resolvedPath, properties, result, importedFiles, depth);
        }
    }

    // reads and merges a .props/.targets file's PropertyGroup/ItemGroup/Import
    // elements into the current evaluation, in place. Unresolved (e.g. SDK-provided)
    // or already-imported files are silently skipped (fail-open, no cycles).
    private async importFile(resolvedPath: string, properties: Record<string, string>, result: ProjectItem[], importedFiles: Set<string>, depth: number): Promise<void> {
        const normalizedPath = resolvedPath.toLocaleLowerCase();
        if (importedFiles.has(normalizedPath) || !(await fs.exists(resolvedPath))) { return; }

        const content = await fs.readFile(resolvedPath);
        const importedDocument = await xml.parseToJson(content);
        const importedProject = XmlManager.getProjectElement(importedDocument);
        if (!importedProject) { return; }
        XmlManager.ensureElements(importedProject);

        importedFiles.add(normalizedPath);
        this.externalFiles.push(resolvedPath);

        const importDir = path.dirname(resolvedPath);
        const previousThisFileDirectory = properties['MSBuildThisFileDirectory'];
        properties['MSBuildThisFileDirectory'] = importDir + path.sep;

        await this.processElements(importedProject.elements, importDir, properties, result, importedFiles, depth + 1);

        properties['MSBuildThisFileDirectory'] = previousThisFileDirectory;
    }

    private async saveProject(): Promise<void> {
        if (!this.document) { return; }

        let content = await xml.parseToXml(this.document);
        await fs.writeFile(this.fullPath, content);
    }

    private isCurrentlyIncluded(sourcePath: string): boolean {
        for (const item of this.projectItems) {
            if (item.isPathIncluded(this.projectFolderPath, sourcePath)) {
                return true;
            }
        }

        return false;
    }

    private isCurrentlyRemoved(sourcePath: string): boolean {
        for (const item of this.projectItems) {
            if (item.isPathRemoved(this.projectFolderPath, sourcePath)) {
                return true;
            }
        }

        return false;
    }

    private getRelativePath(fullpath: string): string {
        return path.relative(path.dirname(this.fullPath), fullpath);
    }

    private getXmlNodeNames(): string[] {
        let result: string[] = [
            "Compile",
            "ClCompile",
            "ClInclude",
            "Content",
            "TypeScriptCompile",
            "CustomBuild",
            "EmbeddedResource",
            "None",
            "Folder"
        ];

        const itemTypes = config.getItemTypes();
        Object.keys(itemTypes).forEach(key => {
            if (result.indexOf(itemTypes[key]) < 0) {
                result.push(itemTypes[key]);
            }
        });

        return result;
    }

    public static getProjectElement(document: XmlElement): XmlElement | undefined {
        if (document && document.elements) {
            if (document.elements.length === 1) {
                return XmlManager.ensureElements(document.elements[0]);
            } else {
                for (let i = 0; i < document.elements.length; i++) {
                    if (document.elements[i].type !== 'comment') {
                        return XmlManager.ensureElements(document.elements[i]);
                    }
                }
            }
        }
    }

    private static ensureElements(element: XmlElement): XmlElement {
        if (!element.elements || !Array.isArray(element.elements)) {
            element.elements = [];
        }

        return element;
    }

    public async deletePackageReferencesVersion(): Promise<void> {
        await this.ensureIsLoaded();
        if (!this.document) {
            return;
        }
        function removeVersionAttributes(node: any): void {

            if (node.attributes && node.attributes.Version) {
                delete node.attributes.Version; // Eliminar el atributo 'Version'
            }


            for (const key in node) {
                if (node.hasOwnProperty(key) && Array.isArray(node[key])) {
                    node[key].forEach(removeVersionAttributes); // Procesar cada nodo hijo
                }
            }
        }

        removeVersionAttributes(this.document);
        this.saveProject();
        return;

    }
}
