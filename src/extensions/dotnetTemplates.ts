import { execSync } from "@extensions/child_process";

export interface ProjectTemplate {
    name: string;
    shortName: string;
    languages: string[];
    tags: string[];
}

let cachedTemplates: ProjectTemplate[] = [
    // { name: 'Console application', value: 'console', languages: ['C#', 'F#', 'VB'] },
    // { name: 'Class library', value: 'classlib', languages: ['C#', 'F#', 'VB'] },
    // { name: 'WPF Application', value: 'wpf', languages: ['C#'] },
    // { name: 'WPF Class library', value: 'wpflib', languages: ['C#'] },
    // { name: 'WPF Custom Control Library', value: 'wpfcustomcontrollib', languages: ['C#'] },
    // { name: 'WPF User Control Library', value: 'wpfusercontrollib', languages: ['C#'] },
    // { name: 'Windows Forms (WinForms) Application', value: 'winforms', languages: ['C#'] },
    // { name: 'Windows Forms (WinForms) Class library', value: 'winformslib', languages: ['C#'] },
    // { name: 'Worker Service', value: 'worker', languages: ['C#'] },
    // { name: 'Unit test project', value: 'mstest', languages: ['C#', 'F#', 'VB'] },
    // { name: 'xUnit test project', value: 'xunit', languages: ['C#', 'F#', 'VB'] },
    // { name: 'NUnit 3 Test Project', value: 'nunit', languages: ['C#', 'F#', 'VB'] },
    // { name: 'ASP.NET Core empty', value: 'web', languages: ['C#', 'F#'] },
    // { name: 'ASP.NET Core Web App (Model-View-Controller)', value: 'mvc', languages: ['C#', 'F#'] },
    // { name: 'ASP.NET Core Web App', value: 'razor', languages: ['C#'] },
    // { name: 'ASP.NET Core with Angular', value: 'angular', languages: ['C#'] },
    // { name: 'ASP.NET Core with React.js', value: 'react', languages: ['C#'] },
    // { name: 'ASP.NET Core with React.js and Redux', value: 'reactredux', languages: ['C#'] },
    // { name: 'ASP.NET Core Web API', value: 'webapi', languages: ['C#', 'F#'] },
    // { name: 'ASP.NET Core gRPC Service', value: 'grpc', languages: ['C#'] },
    // { name: 'Blazor Server App', value: 'blazorserver', languages: ['C#'] },
    // { name: 'Blazor WebAssembly App', value: 'blazorwasm', languages: ['C#'] },
    // { name: 'Razor Class Library', value: 'razorclasslib', languages: ['C#'] },
];


export function listProjectTemplates(): ProjectTemplate[] {
    if (cachedTemplates.length > 0) { return cachedTemplates; }

    const buffer = execSync('dotnet new list');
    if (!buffer) { return cachedTemplates; }

    const lines = buffer.toString().split('\n');
    if (lines.length > 4) {
        lines.splice(0, 4); /* ignore header */
        lines.forEach(line => {
            const parts = line.split('  ').filter(element => element);
            if (parts.length > 2) {
                const template: ProjectTemplate = {
                    name: parts[0].trim(),
                    shortName: parts[1].trim().split(',')[0],
                    languages: parts[2].split(',').map(element => element.trim().replace('[', '').replace(']', '')),
                    tags: parts.length > 3 ? parts[3].split(',').map(element => element.trim()).filter(element => element) : []
                };
                if (template.languages.length > 0) {
                    cachedTemplates.push(template);
                }
            }
        });
    }

    return cachedTemplates;
}

const FRAMEWORK_TOKEN_REGEX = /\b(net\d+(?:\.\d+)?|netstandard\d+\.\d+|netcoreapp\d+\.\d+|net4\d\d)\b/g;

// Best-effort: dotnet new --help output format varies across SDK versions/template
// packs, so this only looks for framework moniker tokens near a --framework/-f
// mention rather than fully parsing the CLI help grammar. Returns [] (caller falls
// back to free text) if nothing usable is found.
export function parseFrameworksFromHelpOutput(helpText: string): string[] {
    const lines = helpText.split('\n');
    const frameworkLineIndex = lines.findIndex(line => /--framework\b|(^|\s)-f(\s|,)/.test(line));
    if (frameworkLineIndex < 0) { return []; }

    const window = lines.slice(frameworkLineIndex, frameworkLineIndex + 6).join('\n');
    const found = new Set<string>();
    let match;
    FRAMEWORK_TOKEN_REGEX.lastIndex = 0;
    while ((match = FRAMEWORK_TOKEN_REGEX.exec(window)) !== null) {
        found.add(match[1]);
    }

    return Array.from(found);
}

// Best-effort, same reasoning as parseFrameworksFromHelpOutput: dotnet new --help's
// header format isn't a stable contract, so this just looks for "Description:"/
// "Author:" lines rather than fully parsing the CLI help grammar.
export function parseDetailsFromHelpOutput(helpText: string): { description?: string; author?: string } {
    const lines = helpText.split('\n');
    const descriptionLine = lines.find(line => /^\s*Description:/i.test(line));
    const authorLine = lines.find(line => /^\s*Author:/i.test(line));
    return {
        description: descriptionLine ? descriptionLine.replace(/^\s*Description:\s*/i, '').trim() || undefined : undefined,
        author: authorLine ? authorLine.replace(/^\s*Author:\s*/i, '').trim() || undefined : undefined
    };
}

export interface TemplateDetails {
    frameworks: string[];
    description?: string;
    author?: string;
}

// Single dotnet new <template> --help call, reused for both the framework choices
// and the description/author shown in the panel - avoids spawning the process twice
// per template selection.
export function getTemplateDetails(shortName: string): TemplateDetails {
    try {
        const buffer = execSync(`dotnet new ${shortName} --help`);
        if (!buffer) { return { frameworks: [] }; }
        const text = buffer.toString();
        return {
            frameworks: parseFrameworksFromHelpOutput(text),
            ...parseDetailsFromHelpOutput(text)
        };
    } catch {
        return { frameworks: [] };
    }
}
