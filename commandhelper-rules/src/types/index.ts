// This file exports types and interfaces used throughout the extension, such as the structure for command information and decoration options.
import * as vscode from 'vscode';

export interface CommandInfo {
    description: string;
    gifFile: string;
}

export interface CommandDictionary {
    [key: string]: CommandInfo;
}

export interface DecorationOptions {
    range: vscode.Range;
    hoverMessage?: string;
    backgroundColor?: string;
    borderColor?: string;
}