// Fichier pour gérer l'affichage des commandes et des raccourcis

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { commandInfo, commandInfoInvisible } from './commandInfo';
import { updateDecorations } from './highlightManager';

// Collection de diagnostics pour les infobulles
export const diagnosticCollection = vscode.languages.createDiagnosticCollection("shortcutHelper");

// Panneau pour les GIFs
let panel: vscode.WebviewPanel | undefined = undefined;

let recommendationBlocks: string = '';

function createRecommendationBlock(recommendation: string, description: string, gifPath: vscode.Uri): string {
    return `
        <details open>
            <summary><strong>${recommendation}</strong></summary>
            <p>${description}</p>
            <div class="gif-container">
                <img src="${gifPath}" alt="Tutoriel ${recommendation}">
            </div>
        </details>
    `;
}

function getFullWebviewContent(content: string): string {
    return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; }
                h1 { color: #007acc; font-size: 24px; text-align: center; }
                p { color: #0d0d32; font-size: 15px; text-align: left; }
                details { margin-bottom: 15px; background: #fff; padding: 10px; border-radius: 5px; box-shadow: 0 0 5px rgba(0,0,0,0.1); }
                summary { cursor: pointer; font-size: 18px; color: #007acc; }
                .gif-container { display: flex; justify-content: center; margin: 10px 0; }
                .gif-container img { max-width: 60%; border-radius: 10px; }
                button {
                    background: #d9534f;
                    color: white;
                    padding: 10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    display: block;
                    margin: 30px auto 0;
                }
                button:hover {
                    background: #c9302c;
                }
            </style>
        </head>
        <body>
            <h1>Recommandations</h1>
            ${content}
            <button onclick="vscode.postMessage({ command: 'close' })">Fermer</button>
            <script>
                const vscode = acquireVsCodeApi();
            </script>
        </body>
        </html>
    `;
}


// Mise à jour du panneau de recommandation
export function updateRecommendationPanel(recommendation: string, context: vscode.ExtensionContext) {
    const allCommands = { ...commandInfo, ...commandInfoInvisible };
    const cmdInfo = allCommands[recommendation];

    if (!cmdInfo) {
        vscode.window.showErrorMessage(`Aucune information trouvée pour la commande ${recommendation}`);
        return;
    }

    if (!panel) {
        panel = vscode.window.createWebviewPanel(
            'recommendationsPanel',
            'Recommandations',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'src', 'media'))
                ]
            }
        );

        panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'close') {
                panel?.dispose();
                panel = undefined;
            }
        });

        panel.onDidDispose(() => {
            panel = undefined;
            recommendationBlocks = ''; // Clear content
        });
    }

    const { description, gifFile } = cmdInfo;
    const gifPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'media', gifFile));

    try {
        fs.accessSync(gifPath.fsPath, fs.constants.R_OK);
    } catch (err) {
        console.error(`Erreur: Le fichier GIF n'existe pas: ${gifPath.fsPath}`);
        vscode.window.showErrorMessage(`Le fichier GIF pour ${recommendation} est introuvable: ${gifFile}`);
        return;
    }

    const gifWebviewUri = panel.webview.asWebviewUri(gifPath);
    recommendationBlocks += createRecommendationBlock(recommendation, description, gifWebviewUri);
    panel.webview.html = getFullWebviewContent(recommendationBlocks);

}

// Mise en surbrillance avec diagnostic
export function highlightWithDiagnostic(editor: vscode.TextEditor, recommendation: string, ranges: vscode.Range[]) {
    const allCommands = { ...commandInfo, ...commandInfoInvisible };
    const cmdInfo = allCommands[recommendation];
    if (!cmdInfo) { return; }

    const document = editor.document;

    const existingDiagnostics = diagnosticCollection.get(document.uri) || [];

    const filteredDiagnostics = existingDiagnostics.filter(diag => {
        const diagMessage = diag.message;
        return !diagMessage.startsWith(recommendation);
    });

    let newDiagnostics: vscode.Diagnostic[] = [];
    let decorations: vscode.DecorationOptions[] = [];

    for (const range of ranges) {
        const existingAtSamePos = filteredDiagnostics.find(d =>
            d.range.isEqual(range)
        );

        if (!existingAtSamePos) {
            let diagnostic = new vscode.Diagnostic(
                range,
                `${recommendation} : ${cmdInfo.description}`,
                vscode.DiagnosticSeverity.Information
            );

            diagnostic.tags = [vscode.DiagnosticTag.Unnecessary];

            diagnostic.code = {
                value: "Voir plus",
                target: vscode.Uri.parse(`command:commandhelper.showRecommendation?${encodeURIComponent(JSON.stringify([recommendation]))}`)
            };

            newDiagnostics.push(diagnostic);
        }

        decorations.push({ range });
    }

    const updatedDiagnostics = [...filteredDiagnostics, ...newDiagnostics];

    diagnosticCollection.set(document.uri, updatedDiagnostics);

    updateDecorations(editor, recommendation, decorations);
}

// Fermeture du panneau
export function disposePanel() {
    if (panel) {
        panel.dispose();
        panel = undefined;
    }
}