import * as Utilities from '../models/Utilities'
import Item from './Item'
import ProjectItem from './ProjectItem'

export default class CspCsProjectItem extends ProjectItem {
	constructor(name: string, projectPath:string) {
		super(name, projectPath);
	}

	public getChildren(): Item[] {
		return Utilities.getDirectoryItems(this.folderPath);
	}
}
