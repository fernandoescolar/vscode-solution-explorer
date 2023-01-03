/***********
 * TypeScript simplified version of:
 * https://github.com/Microsoft/msbuild/blob/master/src/Build/Construction/Solution/SolutionFile.cs
 */
import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { ProjectInSolution } from "./ProjectInSolution";
import { SolutionConfigurationInSolution } from "./SolutionConfigurationInSolution";
import { SolutionProjectType } from "./SolutionProjectType";
import { ProjectConfigurationInSolution } from "./ProjectConfigurationInSolution";

const vbProjectGuid = "{F184B08F-C81C-45F6-A57F-5ABD9991F28F}";
const csProjectGuid = "{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}";
const cpsProjectGuid = "{13B669BE-BB05-4DDF-9536-439F39A36129}"; //common project system
const cpsCsProjectGuid = "{9A19103F-16F7-4668-BE54-9A1E7A4F7556}"; //common project system
const cpsVbProjectGuid = "{778DAE3C-4631-46EA-AA77-85C1314464D9}"; //common project system
const vjProjectGuid = "{E6FDF86B-F3D1-11D4-8576-0002A516ECE8}";
const vcProjectGuid = "{8BC9CEB8-8B4A-11D0-8D11-00A0C91BC942}";
const fsProjectGuid = "{F2A71F9B-5D33-465A-A702-920D77279786}";
const cpsFsProjectGuid = "{6EC3EE1D-3C4E-46DD-8F32-0CC8E7565705}";
const dbProjectGuid = "{C8D11400-126E-41CD-887F-60BD40844F9E}";
const wdProjectGuid = "{2CFEAB61-6A3B-4EB8-B523-560B4BEEF521}";
const webProjectGuid = "{E24C65DC-7377-472B-9ABA-BC803B73C61A}";
const solutionFolderGuid = "{2150E333-8FDC-42A3-9474-1A3956D46DE8}";


export class SolutionFile {
    private _lines: string[] = [];
    private _currentLineIndex: number = -1;
    private _projects:{ [id: string] : ProjectInSolution; } = {};
    private _solutionConfigurations: SolutionConfigurationInSolution[] = [];
    private _currentVisualStudioVersion: string = "";
    private _name: string = "";
    private _fullPath: string = "";
    private _folderPath: string = "";
    private _version: string = "";
    private _solutionContainsWebProjects: boolean = false;
    private _solutionContainsWebDeploymentProjects: boolean = false;

    private constructor() {
    }

    public get name(): string {
        return this._name;
    }

    public get fullPath(): string {
        return this._fullPath;
    }

    public get folderPath(): string {
        return this._folderPath;
    }

    public get version(): string {
        return this._version;
    }

    public get currentVisualStudioVersion(): string {
        return this._currentVisualStudioVersion;
    }

    public get containsWebProjects(): boolean {
        return this._solutionContainsWebProjects;
    }

    public get containsWebDeploymentProjects(): boolean {
        return this._solutionContainsWebDeploymentProjects;
    }

    public get projectsById(): { [id: string] : ProjectInSolution; } {
        return this._projects;
    }

    public get projects(): ProjectInSolution[] {
        let result: ProjectInSolution[] = [];
        Object.keys(this._projects).forEach(key => {
            result.push(this._projects[key]);
        });

        return result;
    }

    public get configurations(): SolutionConfigurationInSolution[] {
        return this._solutionConfigurations;
    }

    public static async parse(solutionFullPath: string) : Promise<SolutionFile> {
        let solution = new SolutionFile();
        solution._fullPath = solutionFullPath;
        solution._folderPath = path.dirname(solutionFullPath);
        solution._name = (solutionFullPath.split(path.sep).pop() || "").replace('.sln', '');

        const content = await fs.readFile(solutionFullPath);
        solution._lines = content.split('\n');
        solution._currentLineIndex = 0;
        solution.parseSolution();

        return solution;
    }

    private readLine(): string | null {
        if (this._currentLineIndex >= this._lines.length) {
            return null;
        }

        return this._lines[this._currentLineIndex++].trim();
    }

    private parseSolution(): void {
        this.parseFileHeader();

        let str: string | null;
        let rawProjectConfigurationsEntries: { [id: string]: string } | undefined;
        while ((str = this.readLine()) !== null)
        {
            if (str.startsWith("Project("))
            {
                this.parseProject(str);
            }
            else if (str.startsWith("GlobalSection(NestedProjects)"))
            {
                this.parseNestedProjects();
            }
            else if (str.startsWith("GlobalSection(SolutionConfigurationPlatforms)"))
            {
                this.parseSolutionConfigurations();
            }
            else if (str.startsWith("GlobalSection(ProjectConfigurationPlatforms)"))
            {
                rawProjectConfigurationsEntries = this.parseProjectConfigurations();
            }
            else if (str.startsWith("VisualStudioVersion"))
            {
                this._currentVisualStudioVersion = this.parseVisualStudioVersion(str);
            }
            else
            {
                // No other section types to process at this point, so just ignore the line
                // and continue.
            }
        }

        if (rawProjectConfigurationsEntries)
        {
            this.processProjectConfigurationSection(rawProjectConfigurationsEntries);
        }
    }

    private parseFileHeader(): void {
        const slnFileHeaderNoVersion: string = "Microsoft Visual Studio Solution File, Format Version ";
        for (let i = 1; i <= 2; i++) {
            let str: string | null = this.readLine();
            if (str === null) {
                break;
            }

            if (str.startsWith(slnFileHeaderNoVersion)) {
                // Found it.  Validate the version.
                this._version = str.substring(slnFileHeaderNoVersion.length);
                return;
            }
        }
    }

    private parseProject(firstLine: string): void {
        let proj = new ProjectInSolution(this);

        // Extract the important information from the first line.
        this.parseFirstProjectLine(firstLine, proj);

        let line: string | null;
        while ((line = this.readLine()) !== null)
        {
            // If we see an "EndProject", well ... that's the end of this project!
            if (line === "EndProject")
            {
                break;
            }
            else if (line.startsWith("ProjectSection(SolutionItems)"))
            {
                // We have a ProjectDependencies section.  Each subsequent line should identify
                // a dependency.
                line = this.readLine();
                while ((line !== null) && (!line.startsWith("EndProjectSection")))
                {
                    const propertyLineRegEx = /(.*)\s*=\s*(.*)/g;
                    const m = propertyLineRegEx.exec(line);
                    if (m && m.length >= 3) {
                        const fileName: string = path.basename(m[1].replace(/\\/g, path.sep).trim());
                        const filePath: string = m[2].replace(/\\/g, path.sep).trim();
                        proj.addFile(fileName, filePath);
                    }

                    line = this.readLine();
                }
            }
            else if (line.startsWith("ProjectSection(ProjectDependencies)"))
            {
                // We have a ProjectDependencies section.  Each subsequent line should identify
                // a dependency.
                line = this.readLine();
                while ((line !== null) && (!line.startsWith("EndProjectSection")))
                {
                    let propertyLineRegEx = /(.*)\s*=\s*(.*)/g;
                    let m = propertyLineRegEx.exec(line);
                    if (m && m.length >= 2) {
                        let parentGuid: string = m[1].trim();
                        proj.addDependency(parentGuid);
                    }

                    line = this.readLine();
                }
            }
            else if (line.startsWith("ProjectSection(WebsiteProperties)"))
            {
                // We have a WebsiteProperties section.  This section is present only in Venus
                // projects, and contains properties that we'll need in order to call the
                // AspNetCompiler task.
                line = this.readLine();
                while ((line !== null) && (!line.startsWith("EndProjectSection")))
                {
                    let propertyLineRegEx = /(.*)\s*=\s*(.*)/g;
                    let m = propertyLineRegEx.exec(line);
                    if (m && m.length >= 3) {
                        let propertyName: string = m[1].trim();
                        let propertyValue: string = m[2].trim();
                        proj.addWebProperty(propertyName, propertyValue);
                    }

                    line = this.readLine();
                }
            }
        }
    }

    private parseFirstProjectLine(firstLine: string, proj: ProjectInSolution): void {
        let projectRegEx = /Project\("(.*)"\)\s*=\s*"(.*)"\s*,\s*"(.*)"\s*,\s*"(.*)"/g;
        let m = projectRegEx.exec(firstLine);
        if (m && m.length >= 5) {
            proj.projectTypeId = m[1].trim();
            proj.projectName = m[2].trim();
            proj.relativePath = m[3].trim();
            proj.fullPath = path.join(this.folderPath, m[3].replace(/\\/g, path.sep)).trim();
            proj.projectGuid = m[4].trim();
        }

        this._projects[proj.projectGuid] = proj;

        if ((proj.projectTypeId === vbProjectGuid) ||
            (proj.projectTypeId === csProjectGuid) ||
            (proj.projectTypeId === cpsProjectGuid) ||
            (proj.projectTypeId === cpsCsProjectGuid) ||
            (proj.projectTypeId === cpsVbProjectGuid) ||
            (proj.projectTypeId === fsProjectGuid) ||
            (proj.projectTypeId === cpsFsProjectGuid) ||
            (proj.projectTypeId === dbProjectGuid) ||
            (proj.projectTypeId === vjProjectGuid))
        {
            proj.projectType = SolutionProjectType.knownToBeMSBuildFormat;
        }
        else if (proj.projectTypeId === solutionFolderGuid)
        {
            proj.projectType = SolutionProjectType.solutionFolder;
        }
        // MSBuild format VC projects have the same project type guid as old style VC projects.
        // If it's not an old-style VC project, we'll assume it's MSBuild format
        else if (proj.projectTypeId === vcProjectGuid)
        {
            proj.projectType = SolutionProjectType.knownToBeMSBuildFormat;
        }
        else if (proj.projectTypeId === webProjectGuid)
        {
            proj.projectType = SolutionProjectType.webProject;
            this._solutionContainsWebProjects = true;
        }
        else if (proj.projectTypeId === wdProjectGuid)
        {
            proj.projectType = SolutionProjectType.webDeploymentProject;
            this._solutionContainsWebDeploymentProjects = true;
        }
        else
        {
            proj.projectType = SolutionProjectType.unknown;
        }

    }

    private parseNestedProjects(): void {
        let str: string | null;
        do
        {
            str = this.readLine();
            if ((str === null) || (str === "EndGlobalSection")) {
                break;
            }

            if (!str) {
                continue;
            }

            let propertyLineRegEx = /(.*)\s*=\s*(.*)/g;
            let m = propertyLineRegEx.exec(str);
            if (m && m.length >= 3) {
                let projectGuid: string = m[1].trim();
                let parentProjectGuid: string = m[2].trim();

                let proj: ProjectInSolution = this._projects[projectGuid];
                if (!proj) {
                    // error
                }

                proj.parentProjectGuid = parentProjectGuid;
            }
        } while (true);
    }

    private parseSolutionConfigurations(): void {
        let str: string | null;
        let nameValueSeparator: string = '=' ;
        let configPlatformSeparators: string = '|';

        do
        {
            str = this.readLine();

            if ((str === null) || (str === "EndGlobalSection")) {
                break;
            }

            if (!str) {
                continue;
            }

            let configurationNames: string[] = str.split(nameValueSeparator);
            let fullConfigurationName: string = configurationNames[0].trim();

            if (fullConfigurationName === "DESCRIPTION") {
                continue;
            }

            let configurationPlatformParts: string[] = fullConfigurationName.split(configPlatformSeparators);

            this._solutionConfigurations.push(new SolutionConfigurationInSolution(configurationPlatformParts[0], configurationPlatformParts[1]));
        } while (true);
    }

    private parseProjectConfigurations(): { [id: string]: string } {
        let rawProjectConfigurationsEntries: { [id: string]: string } = {};
        let str : string | null;
        do
        {
            str = this.readLine();

            if ((str === null) || (str === "EndGlobalSection")) {
                break;
            }

            if (!str) {
                continue;
            }

            let nameValue: string[] = str.split('=');
            rawProjectConfigurationsEntries[nameValue[0].trim()] = nameValue[1].trim();
        } while (true);

        return rawProjectConfigurationsEntries;
    }

    private parseVisualStudioVersion(str: string): string
    {
        let delimiterChars: string = '=';
        let words: string[] = str.split(delimiterChars);

        return words[1].trim();
    }

    private processProjectConfigurationSection(rawProjectConfigurationsEntries: { [id: string]: string }): void {
        // Instead of parsing the data line by line, we parse it project by project, constructing the
        // entry name (e.g. "{A6F99D27-47B9-4EA4-BFC9-25157CBDC281}.Release|Any CPU.ActiveCfg") and retrieving its
        // value from the raw data. The reason for this is that the IDE does it this way, and as the result
        // the '.' character is allowed in configuration names although it technically separates different
        // parts of the entry name string. This could lead to ambiguous results if we tried to parse
        // the entry name instead of constructing it and looking it up. Although it's pretty unlikely that
        // this would ever be a problem, it's safer to do it the same way VS IDE does it.
        let configPlatformSeparators = '|';

        Object.keys(this._projects).forEach(key => {
            let project = this._projects[key];
            // Solution folders don't have configurations
            if (project.projectType !== SolutionProjectType.solutionFolder)
            {
                this._solutionConfigurations.forEach(solutionConfiguration => {
                    // The "ActiveCfg" entry defines the active project configuration in the given solution configuration
                    // This entry must be present for every possible solution configuration/project combination.
                    let entryNameActiveConfig: string = project.projectGuid + "." + solutionConfiguration.fullName + ".ActiveCfg";

                    // The "Build.0" entry tells us whether to build the project configuration in the given solution configuration.
                    // Technically, it specifies a configuration name of its own which seems to be a remnant of an initial,
                    // more flexible design of solution configurations (as well as the '.0' suffix - no higher values are ever used).
                    // The configuration name is not used, and the whole entry means "build the project configuration"
                    // if it's present in the solution file, and "don't build" if it's not.
                    let entryNameBuild = project.projectGuid + "." + solutionConfiguration.fullName + ".Build.0";

                    if (rawProjectConfigurationsEntries[entryNameActiveConfig]) {
                        let configurationPlatformParts = rawProjectConfigurationsEntries[entryNameActiveConfig].split(configPlatformSeparators);

                        let projectConfiguration = new ProjectConfigurationInSolution(
                            configurationPlatformParts[0],
                            (configurationPlatformParts.length > 1) ? configurationPlatformParts[1] : '',
                            !!rawProjectConfigurationsEntries[entryNameBuild]
                        );

                        project.setProjectConfiguration(solutionConfiguration.fullName, projectConfiguration);
                    }
                });
            }
        });
    }
}
