import * as path from "@extensions/path";
import * as xml from "@extensions/xml";
import { Solution, SolutionFolder, SolutionItem, SolutionProject } from "../model";
import { v4 as uuidv4 } from "uuid";

/**
 * Helper to mutate a .slnx XML document for operations like create/delete/rename/move
 * folders and solution files. Preserves unknown XML structure and formatting.
 */
export class SlnxDocumentEditor {
    constructor(private readonly solution: Solution, private readonly rootElement: xml.XmlElement) {}

    /**
     * Create a new solution folder and add it to the parent container.
     */
    public createFolder(name: string, parentItem?: SolutionFolder): { folder: SolutionFolder; xmlElement: xml.XmlElement } {
        const guid = uuidv4().toUpperCase();
        const newFolderElement: xml.XmlElement = {
            type: 'element',
            name: 'Folder',
            attributes: { Name: name },
            elements: []
        };

        const parentContainer = this.getXmlContainerForItem(parentItem);
        if (!parentContainer.elements) {
            parentContainer.elements = [];
        }
        parentContainer.elements.push(newFolderElement);

        // Create the model object
        const folder = new SolutionFolder(guid);
        folder.name = name;
        folder.fullPath = path.join(this.solution.folderPath, name);
        folder.parent = parentItem;

        return { folder, xmlElement: newFolderElement };
    }

    /**
     * Delete a folder and all its children from the solution.
     */
    public deleteFolder(itemId: string, parentItem?: SolutionFolder): void {
        const parentContainer = this.getXmlContainerForItem(parentItem);
        if (!parentContainer.elements) {
            return;
        }

        const index = parentContainer.elements.findIndex((el: xml.XmlElement) =>
            el.type === 'element' && el.attributes?.Name === itemId
        );

        if (index >= 0) {
            parentContainer.elements.splice(index, 1);
        }
    }

    /**
     * Rename a solution folder by updating its Name attribute.
     */
    public renameFolder(oldName: string, newName: string, parentItem?: SolutionFolder): void {
        const parentContainer = this.getXmlContainerForItem(parentItem);
        if (!parentContainer.elements) {
            return;
        }

        const folderElement = parentContainer.elements.find((el: xml.XmlElement) =>
            el.type === 'element' && el.name === 'Folder' && el.attributes?.Name === oldName
        );

        if (folderElement && folderElement.attributes) {
            folderElement.attributes.Name = newName;
        }
    }

    /**
     * Move a folder to a different parent (or to root if parentItem is undefined).
     */
    public moveFolder(itemId: string, oldParentItem: SolutionFolder | undefined, newParentItem: SolutionFolder | undefined): void {
        const oldContainer = this.getXmlContainerForItem(oldParentItem);
        const newContainer = this.getXmlContainerForItem(newParentItem);

        if (!oldContainer.elements) {
            return;
        }

        // Find and remove from old parent
        const itemIndex = oldContainer.elements.findIndex((el: xml.XmlElement) =>
            el.type === 'element' && el.attributes?.Name === itemId
        );

        if (itemIndex < 0) {
            return;
        }

        const movedElement = oldContainer.elements[itemIndex];
        oldContainer.elements.splice(itemIndex, 1);

        // Add to new parent
        if (!newContainer.elements) {
            newContainer.elements = [];
        }
        newContainer.elements.push(movedElement);
    }

    /**
     * Rename a project entry (Project element).
     */
    public renameProjectInSolution(oldProjectName: string, newProjectName: string, parentItem?: SolutionFolder): void {
        const parentContainer = this.getXmlContainerForItem(parentItem);
        if (!parentContainer.elements) {
            return;
        }

        const projectElement = parentContainer.elements.find((el: xml.XmlElement) =>
            el.type === 'element' && el.name === 'Project' && el.attributes?.Path?.includes(oldProjectName)
        );

        if (projectElement && projectElement.attributes) {
            // Update the Path attribute to reflect the new project name
            const oldPath = projectElement.attributes.Path;
            const newPath = oldPath.replace(oldProjectName, newProjectName);
            projectElement.attributes.Path = newPath;
        }
    }

    /**
     * Add a solution file (File element) to a folder.
     */
    public addSolutionFile(filename: string, relativeFilePath: string, parentFolder: SolutionFolder): void {
        const parentContainer = this.getXmlContainerForItem(parentFolder);
        if (!parentContainer.elements) {
            parentContainer.elements = [];
        }

        const fileElement: xml.XmlElement = ({
            type: 'element',
            name: 'File',
            attributes: { Path: relativeFilePath },
            elements: []
        }) as xml.XmlElement;

        parentContainer.elements.push(fileElement);
    }

    /**
     * Delete a solution file (File element) from a folder.
     */
    public deleteSolutionFile(filename: string, relativeFilePath: string, parentFolder: SolutionFolder): void {
        const parentContainer = this.getXmlContainerForItem(parentFolder);
        if (!parentContainer.elements) {
            return;
        }

        const index = parentContainer.elements.findIndex((el: xml.XmlElement) =>
            el.type === 'element' &&
            el.name === 'File' &&
            el.attributes?.Path === relativeFilePath
        );

        if (index >= 0) {
            parentContainer.elements.splice(index, 1);
        }
    }

    /**
     * Get the XML container (Solution or Folder) that holds the given item.
     * For undefined (root), returns the Solution root.
     */
    private getXmlContainerForItem(item: SolutionFolder | undefined): xml.XmlElement {
        if (!item) {
            return this.rootElement;
        }

        if (item instanceof SolutionFolder) {
            // Find the Folder element by its Name attribute
            return this.findFolderElement(item.name, this.rootElement) || this.rootElement;
        }

        // For projects, return the root (projects are not containers)
        return this.rootElement;
    }

    /**
     * Recursively find a Folder element by name.
     */
    private findFolderElement(folderName: string, searchIn: xml.XmlElement): xml.XmlElement | undefined {
        if (!searchIn.elements) {
            return undefined;
        }

        for (const el of searchIn.elements as xml.XmlElement[]) {
            if (el.type === 'element' && el.name === 'Folder' && el.attributes?.Name === folderName) {
                return el;
            }

            if (el.type === 'element' && el.name === 'Folder') {
                const found = this.findFolderElement(folderName, el);
                if (found) {
                    return found;
                }
            }
        }

        return undefined;
    }
}
