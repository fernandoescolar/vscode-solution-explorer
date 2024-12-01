import { XmlElement } from "@extensions/xml";
import { ProjectItem } from "./ProjectItem";

export class PropertyGroup extends ProjectItem {
  constructor(public items: Record<string, string>) {
    super("PropertyGroup");
  }

  public toElement(): XmlElement {
    return {
      type: "element",
      name: "PropertyGroup",
      elements: Object.keys(this.items)?.map((k): XmlElement => {
        return {
          type: "element",
          name: k,
          elements: [{ type: "text", text: this.items[k] }],
        };
      }),
    };
  }
}
