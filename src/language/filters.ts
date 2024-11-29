import * as vscode from "vscode";

export const CSPROJ: vscode.DocumentSelector = { pattern: "**/*.csproj" };
export const NUGETDECLARATIONS: vscode.DocumentSelector = {
  pattern: "**/{*.csproj,Directory.Packages.props,Directory.Build.props}",
};
