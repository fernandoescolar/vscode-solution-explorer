import Item from './Item'
import ProjectItem from './ProjectItem'
import StaticTextItem from './StaticTextItem';

export default class UnknownProjectItem extends ProjectItem {
	constructor(name: string, projectPath:string) {
		super(name, projectPath);
	}

	public getChildren(): Item[] {
		return [
			new StaticTextItem('unkown project type')
		];
	}
}
