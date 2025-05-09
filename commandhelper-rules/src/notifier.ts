import * as vscode from 'vscode';
import { commandInfoInvisible } from './commandInfo';
import * as path from 'path';

export function showPopup(command: string) {
  const info = commandInfoInvisible[command];
  if (!info) {return;}

  vscode.window.showInformationMessage(
    `Astuce : ${info.description} (${command})`,
    'Voir plus'
  ).then(selection => {
    if (selection === 'Voir plus') {
      // Récupérer le contexte de l'extension depuis l'extension active
      const extension = vscode.extensions.getExtension('your-name.commandhelper');
      if (!extension) {return;}
      
      const panel = vscode.window.createWebviewPanel(
        'shortcutGif',
        command,
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(extension.extensionPath, 'src', 'media'))
          ]
        }
      );

      const gifPath = vscode.Uri.file(path.join(extension.extensionPath, 'src', 'media', info.gifFile));
      const gifWebviewUri = panel.webview.asWebviewUri(gifPath);

      panel.webview.html = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                img { max-width: 100%; }
                h2 { color: #007acc; }
            </style>
        </head>
        <body>
            <h2>${command}: ${info.description}</h2>
            <img src="${gifWebviewUri}" alt="${command}">
        </body>
        </html>
      `;
    }
  });
}
