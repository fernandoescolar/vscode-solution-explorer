/***********
 * TypeScript simplified version of: 
 * https://github.com/Microsoft/msbuild/blob/master/src/Build/Construction/Solution/ProjectInSolution.cs
 */

export enum SolutionProjectType {
    Unknown,
    /// <summary>
    /// C#, C++, VB, and VJ# projects
    /// </summary>
    KnownToBeMSBuildFormat,
    /// <summary>
    /// Solution folders appear in the .sln file, but aren't buildable projects.
    /// </summary>
    SolutionFolder,
    /// <summary>
    /// ASP.NET projects
    /// </summary>
    WebProject,
    /// <summary>
    /// Web Deployment (.wdproj) projects
    /// </summary>
    WebDeploymentProject, //  MSBuildFormat, but Whidbey-era ones specify ProjectReferences differently
    /// <summary>
    /// Project inside an Enterprise Template project
    /// </summary>
    EtpSubProject
}
