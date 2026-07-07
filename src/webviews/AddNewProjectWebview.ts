import * as vscode from "vscode";
import { t } from "@extensions/translations";
import { ProjectTemplate, getTemplateDetails } from "@extensions/dotnetTemplates";

export interface AddNewProjectFormOptions {
    title: string;
    defaultLocation: string;
    templates: ProjectTemplate[];
}

export interface AddNewProjectResult {
    templateShortName: string;
    language: string;
    projectName: string;
    location: string;
    framework: string;
}

export function showAddNewProjectPanel(context: vscode.ExtensionContext, options: AddNewProjectFormOptions): Promise<AddNewProjectResult | undefined> {
    return new Promise(resolve => {
        const panel = vscode.window.createWebviewPanel(
            "solutionExplorer.addNewProjectUI",
            options.title,
            vscode.ViewColumn.Active,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        let settled = false;
        const settle = (value: AddNewProjectResult | undefined) => {
            if (settled) { return; }
            settled = true;
            resolve(value);
            panel.dispose();
        };

        panel.webview.onDidReceiveMessage(async message => {
            if (message?.type === "create") {
                settle(message.values);
            } else if (message?.type === "cancel") {
                settle(undefined);
            } else if (message?.type === "getTemplateDetails") {
                const details = getTemplateDetails(message.shortName);
                panel.webview.postMessage({ type: "templateDetails", shortName: message.shortName, ...details });
            } else if (message?.type === "browseLocation") {
                const picked = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    defaultUri: vscode.Uri.file(message.current || options.defaultLocation)
                });
                if (picked && picked.length > 0) {
                    panel.webview.postMessage({ type: "locationSelected", path: picked[0].fsPath });
                }
            }
        });

        panel.onDidDispose(() => settle(undefined));

        panel.webview.html = renderHtml(options);
    });
}

function renderHtml(options: AddNewProjectFormOptions): string {
    const strings = {
        searchPlaceholder: t("Search templates..."),
        projectName: t("Project Name"),
        projectLanguage: t("Project Language"),
        location: t("Location"),
        browse: t("Browse..."),
        framework: t(".NET Framework"),
        none: t("(none)"),
        custom: t("Custom..."),
        loadingFrameworks: t("Loading frameworks..."),
        noTemplateSelected: t("Select a template to continue"),
        loadingDescription: t("Loading description..."),
        noFrameworkOption: t("This template does not support choosing a framework"),
        cancel: t("Cancel"),
        create: t("Create"),
    };

    const templatesJson = JSON.stringify(options.templates);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
    body {
        font-family: var(--vscode-font-family);
        color: var(--vscode-foreground);
        padding: 0;
        margin: 0;
        display: flex;
        height: 100vh;
        box-sizing: border-box;
    }
    #left {
        width: 40%;
        min-width: 220px;
        border-right: 1px solid var(--vscode-widget-border, #444);
        display: flex;
        flex-direction: column;
        padding: 12px;
        box-sizing: border-box;
    }
    #right {
        flex: 1;
        padding: 16px 20px;
        box-sizing: border-box;
        overflow-y: auto;
    }
    input[type="text"], select {
        width: 100%;
        box-sizing: border-box;
        padding: 4px 6px;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border, transparent);
        border-radius: 2px;
    }
    #search { margin-bottom: 8px; }
    #templateList {
        flex: 1;
        overflow-y: auto;
        border: 1px solid var(--vscode-widget-border, #444);
        border-radius: 2px;
    }
    .templateItem {
        padding: 6px 8px;
        cursor: pointer;
    }
    .templateItem:hover { background: var(--vscode-list-hoverBackground); }
    .templateItem.selected {
        background: var(--vscode-list-activeSelectionBackground);
        color: var(--vscode-list-activeSelectionForeground);
    }
    .templateTags {
        font-size: 0.8em;
        color: var(--vscode-descriptionForeground);
    }
    .templateItem.selected .templateTags { color: inherit; opacity: 0.8; }
    #templateDescription {
        color: var(--vscode-descriptionForeground);
        font-size: 0.9em;
        margin: -6px 0 16px 0;
        min-height: 1.2em;
    }
    .field { margin-bottom: 14px; }
    label { display: block; margin-bottom: 4px; font-weight: 600; }
    .locationRow { display: flex; gap: 6px; }
    .locationRow input { flex: 1; }
    .placeholder { color: var(--vscode-descriptionForeground); margin-top: 40px; text-align: center; }
    button {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 5px 12px;
        border-radius: 2px;
        cursor: pointer;
    }
    button:hover { background: var(--vscode-button-hoverBackground); }
    button.secondary {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
    }
    button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
    button:disabled { opacity: 0.5; cursor: default; }
    input[type="text"]:disabled, select:disabled { opacity: 0.5; cursor: default; }
    #templateTitle { font-weight: 600; font-size: 1.1em; margin-bottom: 6px; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; }
    .hint { color: var(--vscode-descriptionForeground); font-size: 0.85em; margin-top: 4px; }
</style>
</head>
<body>
    <div id="left">
        <input type="text" id="search" placeholder="${escapeHtml(strings.searchPlaceholder)}" />
        <div id="templateList"></div>
    </div>
    <div id="right">
        <div id="placeholder" class="placeholder">${escapeHtml(strings.noTemplateSelected)}</div>
        <div id="form" style="display:none">
            <div id="templateTitle"></div>
            <div id="templateDescription"></div>
            <div class="field">
                <label for="projectName">${escapeHtml(strings.projectName)}</label>
                <input type="text" id="projectName" />
            </div>
            <div class="field">
                <label for="language">${escapeHtml(strings.projectLanguage)}</label>
                <select id="language"></select>
            </div>
            <div class="field">
                <label for="location">${escapeHtml(strings.location)}</label>
                <div class="locationRow">
                    <input type="text" id="location" value="${escapeHtml(options.defaultLocation)}" />
                    <button type="button" class="secondary" id="browse">${escapeHtml(strings.browse)}</button>
                </div>
            </div>
            <div class="field">
                <label for="frameworkSelect">${escapeHtml(strings.framework)}</label>
                <select id="frameworkSelect" style="display:none"></select>
                <input type="text" id="frameworkCustom" placeholder="e.g. net8.0" style="display:none" />
                <div class="hint" id="frameworkHint"></div>
            </div>
            <div class="actions">
                <button type="button" class="secondary" id="cancel">${escapeHtml(strings.cancel)}</button>
                <button type="button" id="create" disabled>${escapeHtml(strings.create)}</button>
            </div>
        </div>
    </div>

<script>
    const vscode = acquireVsCodeApi();
    const templates = ${templatesJson};
    const i18n = {
        none: ${JSON.stringify(strings.none)},
        custom: ${JSON.stringify(strings.custom)},
        loadingFrameworks: ${JSON.stringify(strings.loadingFrameworks)},
        loadingDescription: ${JSON.stringify(strings.loadingDescription)},
        noFrameworkOption: ${JSON.stringify(strings.noFrameworkOption)}
    };

    let selectedTemplate = null;

    const templateListEl = document.getElementById('templateList');
    const searchEl = document.getElementById('search');
    const placeholderEl = document.getElementById('placeholder');
    const formEl = document.getElementById('form');
    const templateTitleEl = document.getElementById('templateTitle');
    const templateDescriptionEl = document.getElementById('templateDescription');
    const projectNameEl = document.getElementById('projectName');
    const languageEl = document.getElementById('language');
    const locationEl = document.getElementById('location');
    const frameworkSelectEl = document.getElementById('frameworkSelect');
    const frameworkCustomEl = document.getElementById('frameworkCustom');
    const frameworkHintEl = document.getElementById('frameworkHint');
    const createBtn = document.getElementById('create');

    function renderTemplateList(filter) {
        const lower = (filter || '').toLowerCase();
        const filtered = templates.filter(tpl =>
            tpl.name.toLowerCase().includes(lower) ||
            (tpl.tags || []).some(tag => tag.toLowerCase().includes(lower))
        );
        templateListEl.innerHTML = '';
        filtered.forEach(tpl => {
            const div = document.createElement('div');
            div.className = 'templateItem' + (selectedTemplate && selectedTemplate.shortName === tpl.shortName ? ' selected' : '');

            const nameEl = document.createElement('div');
            nameEl.textContent = tpl.name;
            div.appendChild(nameEl);

            if (tpl.tags && tpl.tags.length > 0) {
                const tagsEl = document.createElement('div');
                tagsEl.className = 'templateTags';
                tagsEl.textContent = tpl.tags.join(', ');
                div.appendChild(tagsEl);
            }

            div.addEventListener('click', () => selectTemplate(tpl));
            templateListEl.appendChild(div);
        });
    }

    function selectTemplate(tpl) {
        selectedTemplate = tpl;
        renderTemplateList(searchEl.value);
        placeholderEl.style.display = 'none';
        formEl.style.display = '';
        templateTitleEl.textContent = tpl.name;

        languageEl.innerHTML = '';
        tpl.languages.forEach(lang => {
            const opt = document.createElement('option');
            opt.value = lang;
            opt.textContent = lang;
            languageEl.appendChild(opt);
        });
        languageEl.disabled = tpl.languages.length <= 1;

        templateDescriptionEl.textContent = i18n.loadingDescription;
        frameworkSelectEl.style.display = 'none';
        frameworkCustomEl.style.display = 'none';
        frameworkCustomEl.disabled = false;
        frameworkHintEl.textContent = i18n.loadingFrameworks;
        vscode.postMessage({ type: 'getTemplateDetails', shortName: tpl.shortName });

        validate();
    }

    function validate() {
        const hasTemplate = !!selectedTemplate;
        const hasName = projectNameEl.value.trim().length > 0;
        const hasLocation = locationEl.value.trim().length > 0;
        createBtn.disabled = !(hasTemplate && hasName && hasLocation);
    }

    searchEl.addEventListener('input', () => renderTemplateList(searchEl.value));
    projectNameEl.addEventListener('input', validate);
    locationEl.addEventListener('input', validate);

    document.getElementById('browse').addEventListener('click', () => {
        vscode.postMessage({ type: 'browseLocation', current: locationEl.value });
    });

    document.getElementById('cancel').addEventListener('click', () => {
        vscode.postMessage({ type: 'cancel' });
    });

    createBtn.addEventListener('click', () => {
        const framework = frameworkSelectEl.style.display !== 'none' && frameworkSelectEl.value !== '__custom__'
            ? frameworkSelectEl.value
            : frameworkCustomEl.value.trim();

        vscode.postMessage({
            type: 'create',
            values: {
                templateShortName: selectedTemplate.shortName,
                language: languageEl.value,
                projectName: projectNameEl.value.trim(),
                location: locationEl.value.trim(),
                framework
            }
        });
    });

    window.addEventListener('message', event => {
        const message = event.data;
        if (message.type === 'templateDetails' && selectedTemplate && message.shortName === selectedTemplate.shortName) {
            templateDescriptionEl.textContent = message.description || '';
            if (message.frameworks.length > 0) {
                frameworkHintEl.textContent = '';
                frameworkSelectEl.innerHTML = '';
                const noneOpt = document.createElement('option');
                noneOpt.value = '';
                noneOpt.textContent = i18n.none;
                frameworkSelectEl.appendChild(noneOpt);
                message.frameworks.forEach(fw => {
                    const opt = document.createElement('option');
                    opt.value = fw;
                    opt.textContent = fw;
                    frameworkSelectEl.appendChild(opt);
                });
                const customOpt = document.createElement('option');
                customOpt.value = '__custom__';
                customOpt.textContent = i18n.custom;
                frameworkSelectEl.appendChild(customOpt);
                frameworkSelectEl.style.display = '';
                frameworkSelectEl.disabled = false;
                frameworkCustomEl.style.display = 'none';
                frameworkCustomEl.disabled = false;
            } else {
                frameworkSelectEl.style.display = 'none';
                frameworkCustomEl.style.display = '';
                frameworkCustomEl.value = '';
                frameworkCustomEl.disabled = true;
                frameworkHintEl.textContent = i18n.noFrameworkOption;
            }
        } else if (message.type === 'locationSelected') {
            locationEl.value = message.path;
            validate();
        }
    });

    frameworkSelectEl.addEventListener('change', () => {
        frameworkCustomEl.style.display = frameworkSelectEl.value === '__custom__' ? '' : 'none';
    });

    renderTemplateList('');
</script>
</body>
</html>`;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
