/***********
 * TypeScript simplified version of:
 * https://github.com/Microsoft/msbuild/blob/master/src/Build/Construction/Solution/ProjectInSolution.cs
 */

export enum SolutionProjectType {
    unknown,
    /// <summary>
    /// C#, C++, VB, and VJ# projects
    /// </summary>
    knownToBeMSBuildFormat,
    /// <summary>
    /// Solution folders appear in the .sln file, but aren't buildable projects.
    /// </summary>
    solutionFolder,
    /// <summary>
    /// ASP.NET projects
    /// </summary>
    webProject,
    /// <summary>
    /// Web Deployment (.wdproj) projects
    /// </summary>
    webDeploymentProject, //  MSBuildFormat, but Whidbey-era ones specify ProjectReferences differently
    /// <summary>
    /// Project inside an Enterprise Template project
    /// </summary>
    etpSubProject
}
