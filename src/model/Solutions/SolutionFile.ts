/***********
 * TypeScript simplified version of: 
 * https://github.com/Microsoft/msbuild/blob/master/src/Build/Construction/Solution/SolutionFile.cs
 */

import * as path from "path";
import * as fs from "fs";
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
    private lines: string[];
    private currentLineIndex: number;
    private projects:{ [id: string] : ProjectInSolution; } = {};
    private solutionConfigurations: SolutionConfigurationInSolution[] = [];
    private currentVisualStudioVersion: string;
    private name: string;
    private fullPath: string;
    private folderPath: string;
    private version: string;
    private solutionContainsWebProjects: boolean = false;
    private solutionContainsWebDeploymentProjects: boolean = false;

    private constructor() {
    }

    public get Name(): string {
        return this.name;
    }

    public get FullPath(): string {
        return this.fullPath;
    }

    public get FolderPath(): string {
        return this.folderPath;
    }

    public get Version(): string {
        return this.version;
    }

    public get ContainsWebProjects(): boolean {
        return this.solutionContainsWebProjects;
    }

    public get ContainsWebDeploymentProjects(): boolean {
        return this.solutionContainsWebDeploymentProjects;
    }

    public get ProjectsById(): { [id: string] : ProjectInSolution; } {
        return this.projects;
    }

    public get Projects(): ProjectInSolution[] {
        let result: ProjectInSolution[] = [];
        Object.keys(this.projects).forEach(key => {
            result.push(this.projects[key]);
        });

        return result;
    }

    public get Configurations(): SolutionConfigurationInSolution[] {
        return this.solutionConfigurations;
    }

    public static Parse(solutionFullPath: string) : Thenable<SolutionFile> {
        return new Promise(resolve => {
            let solution = new SolutionFile();
            solution.fullPath = solutionFullPath;
            solution.folderPath = path.dirname(solutionFullPath);
            solution.name = solutionFullPath.split(path.sep).pop().replace('.sln', '');
            
            fs.readFile(solutionFullPath, 'utf8', (err, data) => {
                solution.lines = data.split('\n');
                solution.currentLineIndex = 0;
                solution.ParseSolution();
                resolve(solution);
            });
        });
    }

    private ReadLine(): string {
        if (this.currentLineIndex >= this.lines.length)
            return null;
            
        return this.lines[this.currentLineIndex++].trim();
    }

    private ParseSolution(): void {
        this.ParseFileHeader();

        let str: string;
        let rawProjectConfigurationsEntries: { [id: string]: any };
        while ((str = this.ReadLine()) != null)
        {
            if (str.startsWith("Project("))
            {
                this.ParseProject(str);
            }
            else if (str.startsWith("GlobalSection(NestedProjects)"))
            {
                this.ParseNestedProjects();
            }
            else if (str.startsWith("GlobalSection(SolutionConfigurationPlatforms)"))
            {
                this.ParseSolutionConfigurations();
            }
            else if (str.startsWith("GlobalSection(ProjectConfigurationPlatforms)"))
            {
                rawProjectConfigurationsEntries = this.ParseProjectConfigurations();
            }
            else if (str.startsWith("VisualStudioVersion"))
            {
                this.currentVisualStudioVersion = this.ParseVisualStudioVersion(str);
            }
            else
            {
                // No other section types to process at this point, so just ignore the line
                // and continue.
            }
        }

        if (rawProjectConfigurationsEntries != null)
        {
            this.ProcessProjectConfigurationSection(rawProjectConfigurationsEntries);
        }
    }

    private ParseFileHeader(): void {
        const slnFileHeaderNoVersion: string = "Microsoft Visual Studio Solution File, Format Version ";
        for (let i = 1; i <= 2; i++) {
            let str: string = this.ReadLine();
            if (str == null) {
                break;
            }

            if (str.startsWith(slnFileHeaderNoVersion)) {
                // Found it.  Validate the version.
                this.version = str.substring(slnFileHeaderNoVersion.length);
                return;
            }
        }
    }

    private ParseProject(firstLine: string): void {
        let proj = new ProjectInSolution(this);

        // Extract the important information from the first line.
        this.ParseFirstProjectLine(firstLine, proj);

        let line: string;
        while ((line = this.ReadLine()) != null)
        {
            // If we see an "EndProject", well ... that's the end of this project!
            if (line == "EndProject")
            {
                break;
            }
            else if (line.startsWith("ProjectSection(SolutionItems)"))
            {
                // We have a ProjectDependencies section.  Each subsequent line should identify
                // a dependency.
                line = this.ReadLine();
                while ((line != null) && (!line.startsWith("EndProjectSection")))
                {
                    const propertyLineRegEx = /(.*)\s*=\s*(.*)/g;
                    const m = propertyLineRegEx.exec(line);
                    const fileName: string = path.basename(m[1].trim());
                    const filePath: string = m[2].trim();
                    proj.addFile(fileName, filePath);

                    line = this.ReadLine();
                }
            }
            else if (line.startsWith("ProjectSection(ProjectDependencies)"))
            {
                // We have a ProjectDependencies section.  Each subsequent line should identify
                // a dependency.
                line = this.ReadLine();
                while ((line != null) && (!line.startsWith("EndProjectSection")))
                {
                    let propertyLineRegEx = /(.*)\s*=\s*(.*)/g;
                    let m = propertyLineRegEx.exec(line);
                    let parentGuid: string = m[1].trim();
                    proj.addDependency(parentGuid);

                    line = this.ReadLine();
                }
            }
            else if (line.startsWith("ProjectSection(WebsiteProperties)"))
            {
                // We have a WebsiteProperties section.  This section is present only in Venus
                // projects, and contains properties that we'll need in order to call the 
                // AspNetCompiler task.
                line = this.ReadLine();
                while ((line != null) && (!line.startsWith("EndProjectSection")))
                {
                    let propertyLineRegEx = /(.*)\s*=\s*(.*)/g;
                    let m = propertyLineRegEx.exec(line);
                    let propertyName: string = m[1].trim();
                    let propertyValue: string = m[2].trim();

                    proj.addWebProperty(propertyName, propertyValue);

                    line = this.ReadLine();
                }
            }
        }
    }

    private ParseFirstProjectLine(firstLine: string, proj: ProjectInSolution): void {
        let projectRegEx = /Project\("(.*)"\)\s*=\s*"(.*)"\s*,\s*"(.*)"\s*,\s*"(.*)"/g;
        let m = projectRegEx.exec(firstLine);
        proj.projectTypeId = m[1].trim();
        proj.projectName = m[2].trim();
        proj.relativePath = m[3].trim();
        proj.fullPath = path.join(this.FolderPath, m[3].replace(/\\/g, path.sep)).trim();
        proj.projectGuid = m[4].trim();
        this.projects[proj.projectGuid] = proj;

        if ((proj.projectTypeId == vbProjectGuid) ||
            (proj.projectTypeId == csProjectGuid) ||
            (proj.projectTypeId == cpsProjectGuid) ||
            (proj.projectTypeId == cpsCsProjectGuid) ||
            (proj.projectTypeId == cpsVbProjectGuid) ||
            (proj.projectTypeId == fsProjectGuid) ||
            (proj.projectTypeId == cpsFsProjectGuid) ||
            (proj.projectTypeId == dbProjectGuid) ||
            (proj.projectTypeId == vjProjectGuid))
        {
            proj.projectType = SolutionProjectType.KnownToBeMSBuildFormat;
        }
        else if (proj.projectTypeId == solutionFolderGuid)
        {
            proj.projectType = SolutionProjectType.SolutionFolder;
        }
        // MSBuild format VC projects have the same project type guid as old style VC projects.
        // If it's not an old-style VC project, we'll assume it's MSBuild format
        else if (proj.projectTypeId == vcProjectGuid)
        {
            proj.projectType = SolutionProjectType.KnownToBeMSBuildFormat;
        }
        else if (proj.projectTypeId == webProjectGuid)
        {
            proj.projectType = SolutionProjectType.WebProject;
            this.solutionContainsWebProjects = true;
        }
        else if (proj.projectTypeId == wdProjectGuid)
        {
            proj.projectType = SolutionProjectType.WebDeploymentProject;
            this.solutionContainsWebDeploymentProjects = true;
        }
        else
        {
            proj.projectType = SolutionProjectType.Unknown;
        }
       
    }

    private ParseNestedProjects(): void {
        let str: string;
        do
        {
            str = this.ReadLine();
            if ((str == null) || (str == "EndGlobalSection")) {
                break;
            }

            if (!str) {
                continue;
            }

            let propertyLineRegEx = /(.*)\s*=\s*(.*)/g;
            let m = propertyLineRegEx.exec(str);
            let projectGuid: string = m[1].trim();
            let parentProjectGuid: string = m[2].trim();

            let proj: ProjectInSolution = this.projects[projectGuid];
            if (!proj) {
                // error
            }

            proj.parentProjectGuid = parentProjectGuid;
        } while (true);
    }

    private ParseSolutionConfigurations(): void {
        let str: string;
        let nameValueSeparator: string = '=' ;
        let configPlatformSeparators: string = '|';

        do
        {
            str = this.ReadLine();

            if ((str == null) || (str == "EndGlobalSection")) {
                break;
            }

            if (!str) {
                continue;
            }

            let configurationNames: string[] = str.split(nameValueSeparator);         
            let fullConfigurationName: string = configurationNames[0].trim();

            if (fullConfigurationName === "DESCRIPTION")
                continue;

            let configurationPlatformParts: string[] = fullConfigurationName.split(configPlatformSeparators);

            this.solutionConfigurations.push(new SolutionConfigurationInSolution(configurationPlatformParts[0], configurationPlatformParts[1]));
        } while (true);
    }

    private ParseProjectConfigurations(): { [id: string]: any } {
        let rawProjectConfigurationsEntries: { [id: string]: string } = {};
        let str : string;
        do
        {
            str = this.ReadLine();

            if ((str == null) || (str == "EndGlobalSection")) {
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

    private ParseVisualStudioVersion(str: string): string
    {
        let delimiterChars: string = '=';
        let words: string[] = str.split(delimiterChars);

        return words[1].trim();
    }

    private ProcessProjectConfigurationSection(rawProjectConfigurationsEntries: { [id: string]: string }): void {
        // Instead of parsing the data line by line, we parse it project by project, constructing the 
        // entry name (e.g. "{A6F99D27-47B9-4EA4-BFC9-25157CBDC281}.Release|Any CPU.ActiveCfg") and retrieving its 
        // value from the raw data. The reason for this is that the IDE does it this way, and as the result
        // the '.' character is allowed in configuration names although it technically separates different
        // parts of the entry name string. This could lead to ambiguous results if we tried to parse 
        // the entry name instead of constructing it and looking it up. Although it's pretty unlikely that
        // this would ever be a problem, it's safer to do it the same way VS IDE does it.
        let configPlatformSeparators = '|';

        Object.keys(this.projects).forEach(key => {
            let project = this.projects[key];
            // Solution folders don't have configurations
            if (project.projectType != SolutionProjectType.SolutionFolder)
            {
                this.solutionConfigurations.forEach(solutionConfiguration => {
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
