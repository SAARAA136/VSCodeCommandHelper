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

// Contenu HTML du panneau de recommandation
function getWebviewContent(recommendation: string, description: string, gifPath: vscode.Uri): string {
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
    panel.webview.html = getWebviewContent(recommendation, description, gifWebviewUri);
}

// Mise en surbrillance avec diagnostic
export function highlightWithDiagnostic(editor: vscode.TextEditor, recommendation: string, ranges: vscode.Range[]) {
    const allCommands = { ...commandInfo, ...commandInfoInvisible };
    const cmdInfo = allCommands[recommendation];
    if (!cmdInfo) return;

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