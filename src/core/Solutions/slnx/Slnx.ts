import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as xml from "@extensions/xml";
import { Solution, SolutionFolder, SolutionItem, SolutionParentObject, SolutionProject, SolutionProjectType, SolutionType } from "../model";
import { v4 as uuidv4 } from "uuid";

export class SlnxSolution extends Solution {
    private document: xml.XmlElement | undefined;

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

    private addProject(child: any, parent: SolutionParentObject) : SolutionItem {
        const project = new SolutionProject(uuidv4());
        const projectPath = child.attributes.Path.replace(/\\/g, path.sep).trim();
        project.fullPath = path.join(this.folderPath, projectPath);
        project.name = path.basename(projectPath, path.extname(projectPath));
        project.type = SolutionProjectType.default;

        parent.addItem(project);
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
                const folder = new SolutionFolder(uuidv4());
                folder.name = names[i];
                folder.fullPath = path.join(this.folderPath, folder.name);
                parent.addItem(folder);
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
                    parent.solutionFiles[filename] = path.join(this.folderPath, filepath);
                }
            }
        });

        return parent;
    }
}