import * as vscode from 'vscode';

// Créer des variables pour suivre les décorations actives
export let activeTabDecorations: vscode.DecorationOptions[] = [];
export let activeCommentDecorations: vscode.DecorationOptions[] = [];
export let activeGhostDecorations: vscode.DecorationOptions[] = [];

export const highlightStyles = {
  yellow: vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 255, 0, 0.4)',
    borderRadius: '2px',
  }),
  pink: vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 105, 180, 0.3)',
    borderRadius: '2px',
  }),
  ghost: vscode.window.createTextEditorDecorationType({
    opacity: '0.3',
    textDecoration: 'line-through wavy rgba(200, 0, 0, 0.5)'
  })
};

// Fonction pour effacer toutes les décorations
export function clearAllDecorations(editor: vscode.TextEditor) {
  editor.setDecorations(highlightStyles.yellow, []);
  editor.setDecorations(highlightStyles.pink, []);
  editor.setDecorations(highlightStyles.ghost, []);
  activeTabDecorations = [];
  activeCommentDecorations = [];
  activeGhostDecorations = [];
}

// Fonction pour mettre à jour les décorations par type
export function updateDecorations(editor: vscode.TextEditor, type: string, decorations: vscode.DecorationOptions[]) {
  switch(type) {
    case 'Tabulation':
      editor.setDecorations(highlightStyles.yellow, []);
      editor.setDecorations(highlightStyles.yellow, decorations);
      activeTabDecorations = decorations;
      break;
    case 'CTRL+Shift+/':
    case 'CTRL+Y':
      editor.setDecorations(highlightStyles.pink, []);
      editor.setDecorations(highlightStyles.pink, decorations);
      activeCommentDecorations = decorations;
      break;
    case 'CTRL+Z':
      editor.setDecorations(highlightStyles.ghost, []);
      editor.setDecorations(highlightStyles.ghost, decorations);
      activeGhostDecorations = decorations;
      break;
  }
}