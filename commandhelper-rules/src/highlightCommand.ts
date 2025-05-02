import * as vscode from 'vscode';
import { commandInfo } from './commandInfo';
import { highlightStyles } from './highlightManager';

export function highlightCommand(editor: vscode.TextEditor, command: string, ranges: vscode.Range[]) {
  const style = command === 'Tabulation' ? highlightStyles.yellow
              : command === 'CTRL+Shift+/' || command === 'CTRL+Y' ? highlightStyles.pink
              : undefined;
  
  if (!style || !ranges.length) {return;}

  const decorations = ranges.map(range => ({
    range,
    hoverMessage: new vscode.MarkdownString(`[Voir plus](command:commandhelper.showRecommendation?${encodeURIComponent(JSON.stringify([command]))})`)
  }));
  
  editor.setDecorations(style, decorations);
}