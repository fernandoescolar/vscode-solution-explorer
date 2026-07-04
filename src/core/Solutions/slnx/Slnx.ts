import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as xml from "@extensions/xml";
import { Solution, SolutionFolder, SolutionItem, SolutionParentObject, SolutionProject, SolutionProjectType, SolutionType } from "../model";

export class SlnxSolution extends Solution {
    private document: xml.XmlElement | undefined;
    /** Map from SolutionItem id to XML element for write operations */
    private itemToXml: Map<string, xml.XmlElement> = new Map();

    constructor() {
        super();
        this.type = SolutionType.Slnx;
    }

    public async load(filepath: string): Promise<void> {
        const content = await fs.readFile(filepath);
        this.document = await xml.parseToJson(content);
        this.fullPath = filepath;
        this.folderPath = path.dirname(filepath);
        this.name = path.basename(filepath, path.extname(filepath));
        this.itemToXml.clear();
        this.refresh();
    }

    public refresh(): void {
        if (!this.document) {
            return;
        }

        this.items = [];
        if (this.document.elements.length === 1 && this.document.elements[0].name === 'Solution') {
            this.document.elements[0].elements ||= [];
            this.document.elements[0].elements.forEach((child: { name: string; }) => {
                if (child.name === 'Folder') {
                    this.addFolder(child, this);
                } else if (child.name === 'Project') {
                    this.addProject(child, this);
                }
            });
        }
    }

    /**
     * Get the underlying XML element for a SolutionItem (used during write operations).
     */
    public getXmlElement(itemId: string): xml.XmlElement | undefined {
        return this.itemToXml.get(itemId);
    }

    /**
     * Get the XML solution root element for mutation.
     */
    public getXmlRoot(): xml.XmlElement | undefined {
        if (!this.document) {
            return undefined;
        }
        return this.document.elements.length === 1 && this.document.elements[0].name === 'Solution'
            ? this.document.elements[0]
            : undefined;
    }

    /**
     * Persist the XML document back to disk.
     */
    public async save(): Promise<void> {
        if (!this.document) {
            throw new Error('Cannot save: document not loaded');
        }
        const xmlContent = await xml.parseToXml(this.document);
        await fs.writeFile(this.fullPath, xmlContent);
    }

    private addProject(child: any, parent: SolutionParentObject) : SolutionItem {
        const projectPath = child.attributes.Path.replace(/\\/g, path.sep).trim();
        // Use projectPath as stable ID (relative path)
        const project = new SolutionProject(projectPath);
        project.fullPath = path.join(this.folderPath, projectPath);
        project.name = path.basename(projectPath, path.extname(projectPath));
        project.type = SolutionProjectType.default;
        project.parent = parent;

        parent.addItem(project);
        this.itemToXml.set(project.id, child);
        return project;
    }

    private addFolder(child: any, parent: SolutionParentObject) {
        const names = child.attributes.Name.replace(/^[\/\\]+|[\/\\]+$/g, '').split(/[\/\\]/);
        for (let i = 0; i < names.length; i++) {
            if (!names[i]) continue;

            const existing = parent.getFolders().find((f) => f.name === names[i]);
            if (existing) {
                parent = existing;
            } else {
                // Use folder Name as stable ID
                const folder = new SolutionFolder(child.attributes.Name);
                folder.name = names[i];
                folder.fullPath = path.join(this.folderPath, folder.name);
                folder.parent = parent;
                parent.addItem(folder);
                this.itemToXml.set(folder.id, child);
                parent = folder;
            }
        }

        child.elements ||= [];
        child.elements.forEach((child: {attributes: any; name: string; }) => {
            if (child.name === 'Project') {
                this.addProject(child, parent);
            } else if (child.name === 'Folder') {
                this.addFolder(child, parent);
            } else if (child.name === 'File') {
                const filepath = child.attributes.Path.replace(/\\/g, path.sep).trim();
                if (parent instanceof SolutionFolder) {
                    const filename = path.basename(filepath);
                    // Store as relative path only (not absolute)
                    parent.solutionFiles[filename] = filepath;
                }
            }
        });

        return parent;
    }
}