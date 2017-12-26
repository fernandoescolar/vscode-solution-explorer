import * as Utilities from '../models/Utilities'
import Item from './Item'
import ProjectItem from './ProjectItem'
import ProjectReferencesItem from './ProjectReferencesItem';
import ProjectPackagesItem from './ProjectPackagesItem';
import ProjectReferenceItem from './ProjectReferenceItem';
import ProjectPackageItem from './ProjectPackageItem';
import ProjectReferencesFolderItem from './ProjectReferencesFolderItem';

export default class CspCsProjectItem extends ProjectItem {
	constructor(name: string, projectPath:string) {
		super(name, projectPath);
	}

	public getChildren(): Item[] {
		var result: Item[] = [];
		var folder = new ProjectReferencesFolderItem();
		var references = new ProjectReferencesItem();
		var packages = new ProjectPackagesItem();
		var projectInfo = Utilities.parseCspCsProject(this.path);

		projectInfo.references.forEach(element => { references.children.push(new ProjectReferenceItem(element)); });
		projectInfo.packages.forEach(element => { packages.children.push(new ProjectPackageItem(element.name, element.version)); });

		folder.children.push(references);
		folder.children.push(packages);
		result.push(folder);
		Utilities.getDirectoryItems(this.folderPath).forEach(item => { result.push(item); });

		return result;
	}
}
