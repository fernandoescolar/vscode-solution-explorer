export class ContextValues {
    public static readonly solution = 'solution';
    public static readonly solutionFolder = 'solution-folder';
    public static readonly solutionFile = 'solution-file';
    public static readonly project = 'project';
    public static readonly projectReferences = 'project-references';
    public static readonly projectReferencedProjects = 'project-referenced-projects';
    public static readonly projectReferencedProject = 'project-referenced-project';
    public static readonly projectReferencedPackages = 'project-referenced-packages';
    public static readonly projectReferencedPackage = 'project-referenced-package';
    public static readonly projectReferencedPackageDependency = 'project-referenced-package-dependency';
    public static readonly projectFolder = 'project-folder';
    public static readonly projectFile = 'project-file';
    public static readonly error = 'error';
    public static readonly noSolution = 'no-solution';
    public static readonly multipleSelection = 'multiple-selection';

    public static cps(...contexts: SuffixedContextValue[]) {
        return contexts.map(ctx => ctx + '-cps');
    }
    public static fsharp(...contexts: FSharpContextValue[]) {
        return contexts.map(ctx => ctx + '-fs');
    }
    public static anyLang(...contexts: FSharpContextValue[]) {
        return contexts.map(ctx => ctx + '-fs').concat(contexts);
    }
    public static both(...contexts: SuffixedContextValue[]) {
        return contexts.flatMap(ctx => [ctx !== ContextValues.solution ? ctx + '-standard' : ctx, ctx + '-cps']);
    }

    public static matchAnyLanguage(desiredValue:string, testedValue: string){
        return testedValue.startsWith(desiredValue);
    } 
}

type SuffixedContextValue =
    typeof ContextValues.solution |
    typeof ContextValues.project |
    typeof ContextValues.projectReferencedPackages |
    typeof ContextValues.projectReferencedProjects |
    typeof ContextValues.projectReferencedPackage |
    typeof ContextValues.projectReferencedProject;

type FSharpContextValue =
    //typeof ContextValues.project |
    typeof ContextValues.projectFolder |
    typeof ContextValues.projectFile;