import * as vscode from "vscode";

export const PACKAGE_REFERENCE_FILTER: vscode.DocumentSelector = { pattern: '**/{*.csproj,Directory.Build.props}' };

export const PACKAGE_VERSION_FILTER: vscode.DocumentSelector = { pattern: '**/Directory.Packages.props' };
