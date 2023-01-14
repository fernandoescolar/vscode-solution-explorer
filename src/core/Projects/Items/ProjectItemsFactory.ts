import * as path from "@extensions/path";
import { XmlElement } from "@extensions/xml";
import { ProjectItem } from "./ProjectItem";
import { Reference } from "./Reference";
import { PackageReference } from "./PackageReference";
import { ProjectReference } from "./ProjectReference";
import { Folder } from "./Folder";
import { Include } from "./Include";
import { Remove } from "./Remove";
import { Update } from "./Update";

const ignoreItems = [ "AssemblyMetadata", "BaseApplicationManifest", "CodeAnalysisImport", "COMReference", "COMFileReference", "Import", "InternalsVisibleTo", "NativeReference", "TrimmerRootAssembly", "Using", "Protobuf" ];
const knownTypes = [ "Reference", "PackageReference", "ProjectReference", "Folder", "Content", "Compile", "None", "EmbeddedResource" ];

export function createProjectElement(xml: XmlElement, properties: Record<string, string>): ProjectItem | undefined {
    if (ignoreItems.indexOf(xml.name) >= 0) {
        return undefined;
    }

    if (xml.name === "Reference" && xml.attributes && xml.attributes.Include) {
        const include = replacePropertiesInPath(xml.attributes.Include, properties, false);
        const props = getNameAndVersion(include);
        return new Reference(props.name, props.version);
    }

    if (xml.name === "PackageReference" && xml.attributes && xml.attributes.Include) {
        return new PackageReference(xml.attributes.Include, xml.attributes.Version);
    }

    if (xml.name === "ProjectReference" && xml.attributes && xml.attributes.Include) {
        const fullpath = replacePropertiesInPath(xml.attributes.Include, properties);
        const extension = path.extname(fullpath);
        const name = path.basename(fullpath, extension);
        return new ProjectReference(name, fullpath);
    }

    if (xml.name === "Folder" && xml.attributes && xml.attributes.Include) {
        const include = replacePropertiesInPath(xml.attributes.Include, properties);
        return new Folder(include);
    }

    if (xml.attributes && xml.attributes.Include) {
        const include = replacePropertiesInPath(xml.attributes.Include, properties);
        const link = getLink(xml);
        const linkBase = getLinkBase(xml);
        const dependentUpon = getDependentUpon(xml);
        const excludes = xml.attributes.Exclude
          ? replacePropertiesInPath(xml.attributes.Exclude, properties)
          : undefined;
        return new Include(xml.name, include, link, linkBase, excludes, dependentUpon);
    }

    if (xml.attributes && xml.attributes.Remove) {
        const remove = replacePropertiesInPath(xml.attributes.Remove, properties);
        return new Remove(xml.name, remove);
    }

    if (xml.attributes && xml.attributes.Update) {
        const update = replacePropertiesInPath(xml.attributes.Update, properties);
        const link = getLink(xml);
        const linkBase = getLinkBase(xml);
        return new Update(xml.name, update, link, linkBase);
    }


}

function getDependentUpon(xml: XmlElement) {
    const dependentUpon = xml.elements?.find((e: XmlElement) => e.name === "DependentUpon")?.elements[0].text;
    return dependentUpon ? toOSPath(dependentUpon) : undefined;
}

function getLinkBase(xml: XmlElement) {
    const linkBase = xml.attributes.LinkBase || xml.elements?.find((e: XmlElement) => e.name === "LinkBase")?.elements[0].text;
    return linkBase ? toOSPath(linkBase) : undefined;
}

function getLink(xml: XmlElement) {
    const link = xml.attributes.Link || xml.elements?.find((e: XmlElement) => e.name === "Link")?.elements[0].text;
    return link ? toOSPath(link) : undefined;
}

function getNameAndVersion(fullyQualifiedName: string): { name: string; version: string | undefined; } {
    const parts = fullyQualifiedName.split(',');
    const version = parts.find(p => p.trim().startsWith('Version='));
    return {
        name: parts[0],
        version: version ? version.split('=')[1] : undefined
    };
}

function toOSPath(input: string): string {
    if (!input) {
        return input;
    }
    return input
        .replace(/\\/g, path.sep)
        .trim()
        .replace(new RegExp(`${path.sep}$`), '');
}

function isGlobExpression(input: string): boolean {
    return input.indexOf('*') >= 0
        || input.indexOf('?') >= 0
        || input.indexOf('[') >= 0
        || input.indexOf('{') >= 0;
}

function replacePropertiesInPath(path: string, properties: Record<string, string>, osPath?: boolean): string {
    if (!path || !properties) return path;

    Object.entries(properties).forEach(([key, value]) =>
        path = path.replaceAll(`$(${key})`, value)
    );

    return osPath !== false ? toOSPath(path) : path;
}