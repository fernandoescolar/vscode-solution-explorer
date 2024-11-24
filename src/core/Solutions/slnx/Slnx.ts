import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as xml from "@extensions/xml";
import { Solution, SolutionFolder, SolutionItem, SolutionProject, SolutionProjectType, SolutionType } from "../model";
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
        this.name = path.basename(filepath);
        this.refresh();
    }

    public refresh(): void {
        if (!this.document) {
            return;
        }

        this.items = [];
        if (this.document.elements.length === 1) {
            this.document.elements[0].elements.forEach((child: { name: string; }) => {
                if (child.name === 'Folder') {
                    this.addItem(this.createFolder(child));
                } else if (child.name === 'Project') {
                    this.addItem(this.createProject(child));
                }
            });
        }
    }

    private createProject(child: any) : SolutionItem {
        const project = new SolutionProject(uuidv4());
        const projectPath = child.attributes.Path.replace(/\\/g, path.sep).trim();
        project.fullPath = path.join(this.folderPath, projectPath);
        project.name = path.basename(projectPath, path.extname(projectPath));
        project.type = SolutionProjectType.default;
        return project;
    }

    private createFolder(child: any) {
        const folder = new SolutionFolder(uuidv4());
        folder.name = child.attributes.Name.replace(/^[\/\\]+|[\/\\]+$/g, '');
        folder.fullPath = path.join(this.folderPath, folder.name);

        child.elements.forEach((child: { name: string; }) => {
            if (child.name === 'Project') {
                folder.addItem(this.createProject(child))
            } else if (child.name === 'Folder') {
                folder.addItem(this.createFolder(child));
            }
        });

        return folder;
    }
}