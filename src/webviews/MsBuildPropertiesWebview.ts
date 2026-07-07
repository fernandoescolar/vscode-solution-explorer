import * as vscode from "vscode";
import { t } from "@extensions/translations";

export interface MsBuildPropertiesFormOptions {
    title: string;
    current: Record<string, string>;
    targetFrameworkChoices: string[];
}

const NAMED_KEYS = ["Configuration", "Platform", "TargetFramework"];

export function showMsBuildPropertiesForm(context: vscode.ExtensionContext, options: MsBuildPropertiesFormOptions): Promise<Record<string, string> | undefined> {
    return new Promise(resolve => {
        const panel = vscode.window.createWebviewPanel(
            "solutionExplorer.editMsBuildProperties",
            options.title,
            vscode.ViewColumn.Active,
            { enableScripts: true, retainContextWhenHidden: false }
        );

        let settled = false;
        const settle = (value: Record<string, string> | undefined) => {
            if (settled) { return; }
            settled = true;
            resolve(value);
            panel.dispose();
        };

        panel.webview.onDidReceiveMessage(message => {
            if (message?.type === "save") {
                settle(message.values ?? {});
            } else if (message?.type === "cancel") {
                settle(undefined);
            }
        });

        panel.onDidDispose(() => settle(undefined));

        panel.webview.html = renderHtml(options);
    });
}

function renderHtml(options: MsBuildPropertiesFormOptions): string {
    const configuration = escapeHtml(options.current["Configuration"] ?? "");
    const platform = escapeHtml(options.current["Platform"] ?? "");
    const targetFramework = escapeHtml(options.current["TargetFramework"] ?? "");
    const customEntries = Object.entries(options.current).filter(([key]) => NAMED_KEYS.indexOf(key) < 0);

    const strings = {
        hint: t("These overrides only affect how Solution Explorer evaluates Condition/property values in this workspace - they aren't written to any project file."),
        configuration: t("Configuration"),
        platform: t("Platform"),
        targetFramework: t("TargetFramework"),
        none: t("(none)"),
        custom: t("Custom..."),
        customProperties: t("Custom properties"),
        addProperty: t("+ Add property"),
        cancel: t("Cancel"),
        save: t("Save"),
        propertyName: t("Property name"),
        value: t("Value"),
        remove: t("Remove"),
    };

    const tfOptionsHtml = options.targetFrameworkChoices
        .map(tf => `<option value="${escapeHtml(tf)}" ${tf === options.current["TargetFramework"] ? "selected" : ""}>${escapeHtml(tf)}</option>`)
        .join("");

    const targetFrameworkFieldHtml = options.targetFrameworkChoices.length > 0
        ? `
            <select id="targetFrameworkSelect">
                <option value="">${escapeHtml(strings.none)}</option>
                ${tfOptionsHtml}
                <option value="__custom__" ${options.targetFrameworkChoices.indexOf(options.current["TargetFramework"] ?? "") < 0 && targetFramework ? "selected" : ""}>${escapeHtml(strings.custom)}</option>
            </select>
            <input type="text" id="targetFrameworkCustom" placeholder="e.g. net8.0"
                   value="${targetFramework}"
                   style="${options.targetFrameworkChoices.indexOf(options.current["TargetFramework"] ?? "") < 0 && targetFramework ? "" : "display:none"}" />
        `
        : `<input type="text" id="targetFrameworkCustom" placeholder="e.g. net8.0" value="${targetFramework}" />`;

    const customRowsHtml = customEntries
        .map(([key, value]) => customRowHtml(escapeHtml(key), escapeHtml(value), strings.propertyName, strings.value, strings.remove))
        .join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
    body {
        font-family: var(--vscode-font-family);
        color: var(--vscode-foreground);
        padding: 16px 20px;
    }
    h2 { font-weight: 600; margin-bottom: 4px; }
    .hint { color: var(--vscode-descriptionForeground); margin-bottom: 20px; font-size: 0.9em; }
    .field { margin-bottom: 14px; }
    label { display: block; margin-bottom: 4px; font-weight: 600; }
    input[type="text"], select {
        width: 100%;
        box-sizing: border-box;
        padding: 4px 6px;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border, transparent);
        border-radius: 2px;
    }
    select#targetFrameworkSelect { margin-bottom: 6px; }
    fieldset { border: 1px solid var(--vscode-widget-border, #444); border-radius: 4px; margin: 20px 0; padding: 10px 12px; }
    legend { font-weight: 600; padding: 0 4px; }
    .customRow { display: flex; gap: 6px; margin-bottom: 6px; }
    .customRow input { flex: 1; }
    .customRow button, #addCustom { flex: none; }
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
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; }
</style>
</head>
<body>
    <h2>${escapeHtml(options.title)}</h2>
    <div class="hint">${escapeHtml(strings.hint)}</div>

    <div class="field">
        <label for="configuration">${escapeHtml(strings.configuration)}</label>
        <input type="text" id="configuration" placeholder="e.g. Debug" value="${configuration}" />
    </div>

    <div class="field">
        <label for="platform">${escapeHtml(strings.platform)}</label>
        <input type="text" id="platform" placeholder="e.g. AnyCPU" value="${platform}" />
    </div>

    <div class="field">
        <label>${escapeHtml(strings.targetFramework)}</label>
        ${targetFrameworkFieldHtml}
    </div>

    <fieldset>
        <legend>${escapeHtml(strings.customProperties)}</legend>
        <div id="customRows">${customRowsHtml}</div>
        <button type="button" class="secondary" id="addCustom">${escapeHtml(strings.addProperty)}</button>
    </fieldset>

    <div class="actions">
        <button type="button" class="secondary" id="cancel">${escapeHtml(strings.cancel)}</button>
        <button type="button" id="save">${escapeHtml(strings.save)}</button>
    </div>

<script>
    const vscode = acquireVsCodeApi();
    const i18n = {
        propertyName: ${JSON.stringify(strings.propertyName)},
        value: ${JSON.stringify(strings.value)},
        remove: ${JSON.stringify(strings.remove)}
    };

    const tfSelect = document.getElementById('targetFrameworkSelect');
    const tfCustom = document.getElementById('targetFrameworkCustom');
    if (tfSelect) {
        tfSelect.addEventListener('change', () => {
            tfCustom.style.display = tfSelect.value === '__custom__' ? '' : 'none';
            if (tfSelect.value !== '__custom__') {
                tfCustom.value = tfSelect.value;
            }
        });
    }

    function customRowHtml(key, value) {
        return \`<div class="customRow">
            <input type="text" class="customKey" placeholder="\${i18n.propertyName}" value="\${key}" />
            <input type="text" class="customValue" placeholder="\${i18n.value}" value="\${value}" />
            <button type="button" class="secondary removeCustom">\${i18n.remove}</button>
        </div>\`;
    }

    document.getElementById('addCustom').addEventListener('click', () => {
        const container = document.getElementById('customRows');
        const div = document.createElement('div');
        div.innerHTML = customRowHtml('', '');
        container.appendChild(div.firstElementChild);
    });

    document.getElementById('customRows').addEventListener('click', event => {
        if (event.target.classList.contains('removeCustom')) {
            event.target.closest('.customRow').remove();
        }
    });

    document.getElementById('cancel').addEventListener('click', () => {
        vscode.postMessage({ type: 'cancel' });
    });

    document.getElementById('save').addEventListener('click', () => {
        const values = {};

        const configuration = document.getElementById('configuration').value.trim();
        if (configuration) { values['Configuration'] = configuration; }

        const platform = document.getElementById('platform').value.trim();
        if (platform) { values['Platform'] = platform; }

        const targetFramework = (tfSelect && tfSelect.value && tfSelect.value !== '__custom__' ? tfSelect.value : tfCustom.value).trim();
        if (targetFramework) { values['TargetFramework'] = targetFramework; }

        document.querySelectorAll('.customRow').forEach(row => {
            const key = row.querySelector('.customKey').value.trim();
            const value = row.querySelector('.customValue').value.trim();
            if (key) { values[key] = value; }
        });

        vscode.postMessage({ type: 'save', values });
    });
</script>
</body>
</html>`;
}

function customRowHtml(key: string, value: string, propertyNameLabel: string, valueLabel: string, removeLabel: string): string {
    return `<div class="customRow">
        <input type="text" class="customKey" placeholder="${escapeHtml(propertyNameLabel)}" value="${key}" />
        <input type="text" class="customValue" placeholder="${escapeHtml(valueLabel)}" value="${value}" />
        <button type="button" class="secondary removeCustom">${escapeHtml(removeLabel)}</button>
    </div>`;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
