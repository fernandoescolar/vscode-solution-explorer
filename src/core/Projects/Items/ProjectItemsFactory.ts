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

export function createProjectElement(xml: XmlElement, includePrefix?: string): ProjectItem | undefined {
    if (ignoreItems.indexOf(xml.name) >= 0) {
        return undefined;
    }

    if (xml.name === "Reference" && xml.attributes && xml.attributes.Include) {
        const include = cleanIncludePath(xml.attributes.Include, includePrefix);
        const props = getNameAndVersion(include);
        return new Reference(props.name, props.version);
    }

    if (xml.name === "PackageReference" && xml.attributes && xml.attributes.Include) {
        return new PackageReference(xml.attributes.Include, xml.attributes.Version);
    }

    if (xml.name === "ProjectReference" && xml.attributes && xml.attributes.Include) {
        const include = cleanIncludePath(xml.attributes.Include, includePrefix);
        const fullpath = toOSPath(include);
        const extension = path.extname(fullpath);
        const name = path.basename(fullpath, extension);
        return new ProjectReference(name, fullpath);
    }

    if (xml.name === "Folder" && xml.attributes && xml.attributes.Include) {
        const include = cleanIncludePath(xml.attributes.Include, includePrefix);
        return new Folder(toOSPath(include));
    }

    if (xml.attributes && xml.attributes.Include) {
        const include = cleanIncludePath(xml.attributes.Include, includePrefix);
        const value = toOSPath(include);
        const link = getLink(xml);
        const linkBase = getLinkBase(xml);
        const dependentUpon = getDependentUpon(xml);
        const excludes = xml.attributes.Exclude ? toOSPath(xml.attributes.Exclude) : undefined;
        return new Include(xml.name, value, link, linkBase, excludes, dependentUpon);
    }

    if (xml.attributes && xml.attributes.Remove) {
        const remove = cleanIncludePath(xml.attributes.Remove, includePrefix);
        const value = toOSPath(remove);
        return new Remove(xml.name, value);
    }

    if (xml.attributes && xml.attributes.Update) {
        const update = cleanIncludePath(xml.attributes.Update, includePrefix);
        const value = toOSPath(update);
        const link = getLink(xml);
        const linkBase = getLinkBase(xml);
        return new Update(xml.name, value, link, linkBase);
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

function cleanIncludePath(include: string, includePrefix?: string): string {
    if (includePrefix) {
        return include
                    .split(";")
                    .map(s => s.replace(includePrefix, ""))
                    .join(";");
    }

    return include;
}

function toOSPath(input: string): string {
    if (!input) {
        return input;
    }
    return input.replace(/\\/g, path.sep).trim();
}

function isGlobExpression(input: string): boolean {
    return input.indexOf('*') >= 0
        || input.indexOf('?') >= 0
        || input.indexOf('[') >= 0
        || input.indexOf('{') >= 0;
}