import * as vscode from 'vscode';
import { highlightStyles } from './highlightManager';
import { commandInfo } from './commandInfo';

export function showGhostText(editor: vscode.TextEditor, range: vscode.Range, deletedText: string) {
  const decoration = { range, hoverMessage: new vscode.MarkdownString(`[Voir plus](vscode-resource:/path/to/${commandInfo['CTRL+Z'].gifFile})`) };
  editor.setDecorations(highlightStyles.ghost, [decoration]);
}