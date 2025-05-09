// filepath: /keyboard-shortcuts-recommender/keyboard-shortcuts-recommender/src/webviewManager.ts
import * as vscode from 'vscode';
import * as path from 'path';

export class WebviewManager {
    private panel: vscode.WebviewPanel | undefined;

    constructor(private context: vscode.ExtensionContext) {}

    public createOrUpdatePanel(recommendation: string, description: string) {
        if (!this.panel) {
            this.panel = vscode.window.createWebviewPanel(
                'keyboardShortcutsWebview',
                'Keyboard Shortcuts Recommendations',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    localResourceRoots: [
                        vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'media'))
                    ]
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }

        const gifPath = vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'media', `${recommendation}.gif`));
        const gifWebviewUri = this.panel.webview.asWebviewUri(gifPath);

        this.panel.webview.html = this.getWebviewContent(recommendation, description, gifWebviewUri);
    }

    private getWebviewContent(recommendation: string, description: string, gifPath: vscode.Uri): string {
        return `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; text-align: center; }
                    h1 { color: #007acc; font-size: 24px; }
                    h2 { color: #333; font-size: 20px; margin-bottom: 10px; }
                    p { background: #007acc; color: white; padding: 10px; border-radius: 5px; font-weight: bold; display: inline-block; }
                    .gif-container { display: flex; justify-content: center; margin: 20px 0; }
                    .gif-container img { max-width: 80%; height: auto; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.2); }
                    button {
                        background: #d9534f;
                        color: white;
                        padding: 10px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                    button:hover {
                        background: #c9302c;
                    }
                </style>
            </head>
            <body>
                <h1>Recommandations</h1>
                <h2>${recommendation}</h2>
                <p>${description}</p>
                <div class="gif-container">
                    <img src="${gifPath}" alt="Tutoriel ${recommendation}">
                </div>
                <button onclick="vscode.postMessage({ command: 'close' })">Fermer</button>
                <script>
                    const vscode = acquireVsCodeApi();
                </script>
            </body>
            </html>
        `;
    }
}