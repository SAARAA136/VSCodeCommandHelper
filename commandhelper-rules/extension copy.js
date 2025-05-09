"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const commandInfo_1 = require("./src/commandInfo");
const highlightManager_1 = require("./src/highlightManager");
const highlightManager_2 = require("./src/highlightManager");
let panel = undefined;
const diagnosticCollection = vscode.languages.createDiagnosticCollection("shortcutHelper");
let etats_texte = [];
let etats_curseur = [];
function getWebviewContent(recommendation, description, gifPath) {
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
function updateRecommendationPanel(recommendation, context) {
    const allCommands = { ...commandInfo_1.commandInfo, ...commandInfo_1.commandInfoInvisible };
    const cmdInfo = allCommands[recommendation];
    if (!cmdInfo) {
        vscode.window.showErrorMessage(`Aucune information trouvée pour la commande ${recommendation}`);
        return;
    }
    if (!panel) {
        panel = vscode.window.createWebviewPanel('recommendationsPanel', 'Recommandations', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'src', 'media'))
            ]
        });
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
    }
    catch (err) {
        console.error(`Erreur: Le fichier GIF n'existe pas: ${gifPath.fsPath}`);
        vscode.window.showErrorMessage(`Le fichier GIF pour ${recommendation} est introuvable: ${gifFile}`);
        return;
    }
    const gifWebviewUri = panel.webview.asWebviewUri(gifPath);
    panel.webview.html = getWebviewContent(recommendation, description, gifWebviewUri);
}
function highlightWithDiagnostic(editor, recommendation, ranges) {
    const allCommands = { ...commandInfo_1.commandInfo, ...commandInfo_1.commandInfoInvisible };
    const cmdInfo = allCommands[recommendation];
    if (!cmdInfo)
        return;
    const document = editor.document;
    const existingDiagnostics = diagnosticCollection.get(document.uri) || [];
    const filteredDiagnostics = existingDiagnostics.filter(diag => {
        const diagMessage = diag.message;
        return !diagMessage.startsWith(recommendation);
    });
    let newDiagnostics = [];
    let decorations = [];
    for (const range of ranges) {
        const existingAtSamePos = filteredDiagnostics.find(d => d.range.isEqual(range));
        if (!existingAtSamePos) {
            let diagnostic = new vscode.Diagnostic(range, `${recommendation} : ${cmdInfo.description}`, vscode.DiagnosticSeverity.Information);
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
    (0, highlightManager_1.updateDecorations)(editor, recommendation, decorations);
}
function checkForRemovedElements(editor, changes, context) {
    const document = editor.document;
    const existingDiagnostics = diagnosticCollection.get(document.uri) || [];
    for (const change of changes) {
        if (change.rangeLength > 0 && change.text.length === 0) {
            const updatedDiagnostics = existingDiagnostics.filter(diagnostic => {
                return !change.range.intersection(diagnostic.range);
            });
            if (updatedDiagnostics.length !== existingDiagnostics.length) {
                diagnosticCollection.set(document.uri, updatedDiagnostics);
                const lineText = document.lineAt(change.range.start.line).text;
                if (!lineText.startsWith("    ")) {
                    (0, highlightManager_1.updateDecorations)(editor, 'Tabulation', highlightManager_2.activeTabDecorations.filter(d => d.range.start.line !== change.range.start.line));
                }
                // Pour les commentaires
                if (!lineText.includes("#")) {
                    (0, highlightManager_1.updateDecorations)(editor, 'CTRL+Shift+/', highlightManager_2.activeCommentDecorations.filter(d => d.range.start.line !== change.range.start.line));
                }
                // Forcer l'analyse pour mettre à jour l'affichage
                analyzeCurrentEditor(context);
            }
        }
    }
}
function activate(context) {
    console.log('Command Helper extension is now active');
    // Exécuter automatiquement l'analyse au démarrage
    analyzeCurrentEditor(context);
    // Observer les changements dans l'éditeur actif
    vscode.window.onDidChangeActiveTextEditor(() => {
        analyzeCurrentEditor(context);
    }, null, context.subscriptions);
    // Observer les changements de texte
    vscode.workspace.onDidChangeTextDocument((e) => {
        if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
            const editor = vscode.window.activeTextEditor;
            // Vérifier si des tabulations ou commentaires ont été supprimés
            checkForRemovedElements(editor, e.contentChanges, context);
            // Sauvegarder l'état précédent
            const text = e.document.getText();
            if (etats_texte.length === 0 || etats_texte[etats_texte.length - 1] !== text) {
                etats_texte.push(text);
                // Ne conserver que les 5 derniers états
                if (etats_texte.length > 5) {
                    etats_texte.shift();
                }
            }
            // Sauvegarder l'état du curseur
            const selection = editor.selection;
            etats_curseur.push({
                position: [selection.active.line, selection.active.character],
                start: [selection.start.line, selection.start.character],
                end: [selection.end.line, selection.end.character]
            });
            // Ne conserver que les 5 derniers états du curseur
            if (etats_curseur.length > 5) {
                etats_curseur.shift();
            }
            // Analyser pour trouver des suggestions de raccourcis
            analyzeCurrentEditor(context);
        }
    }, null, context.subscriptions);
    // NOUVEAU: Observer les changements de sélection
    vscode.window.onDidChangeTextEditorSelection((e) => {
        if (e.textEditor === vscode.window.activeTextEditor) {
            // Vérifier spécifiquement les sélections de tout le document (CTRL+A)
            checkCtrlASelection(e.textEditor, context);
        }
    }, null, context.subscriptions);
    // Enregistrer la commande pour afficher la recommandation
    context.subscriptions.push(vscode.commands.registerCommand('commandhelper.showRecommendation', (recommendation) => {
        console.log('Commande showRecommendation appelée avec:', recommendation);
        updateRecommendationPanel(recommendation, context);
    }));
    // Enregistrer aussi la commande manuelle
    context.subscriptions.push(vscode.commands.registerCommand('extension.recommendShortcut', () => {
        analyzeCurrentEditor(context);
    }));
    context.subscriptions.push(diagnosticCollection);
}
// Nouvelle fonction pour vérifier spécifiquement la sélection CTRL+A
function checkCtrlASelection(editor, context) {
    const doc = editor.document;
    const text = doc.getText();
    const lignes = text.split('\n');
    const sel = editor.selection;
    // Vérifier si la sélection correspond à tout le document
    const isFullSelection = !sel.isEmpty &&
        sel.start.line === 0 &&
        sel.start.character === 0 &&
        sel.end.line === lignes.length - 1 &&
        sel.end.character >= lignes[lignes.length - 1].length;
    if (isFullSelection) {
        // Variable statique pour éviter les notifications multiples
        const now = new Date().getTime();
        if (!checkCtrlASelection.lastNotificationTime ||
            (now - checkCtrlASelection.lastNotificationTime) > 3000) {
            checkCtrlASelection.lastNotificationTime = now;
            vscode.window.showInformationMessage(`Astuce : Utilisez CTRL+A pour sélectionner tout le texte`, 'Voir plus').then(selection => {
                if (selection === 'Voir plus') {
                    updateRecommendationPanel('CTRL+A', context);
                }
            });
        }
    }
}
// Propriété pour stocker la dernière notification
checkCtrlASelection.lastNotificationTime = 0;
function analyzeCurrentEditor(context) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    // Vider les diagnostics précédents avant d'ajouter les nouveaux
    diagnosticCollection.clear();
    // AJOUT : Effacer explicitement toutes les décorations de surlignage
    (0, highlightManager_1.clearAllDecorations)(editor);
    // Suite de la fonction...
    // Si on a assez d'états, utiliser Python pour l'analyse avancée
    if (etats_texte.length > 1 && etats_curseur.length > 0) {
        const pythonProcess = (0, child_process_1.spawn)('python', [
            path.join(__dirname, 'recommendation.py'),
            JSON.stringify({ etats_texte, etats_curseur })
        ]);
        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python error: ${data}`);
        });
        pythonProcess.on('close', (code) => {
            if (code === 0 && output.trim()) {
                // Le script peut retourner plusieurs recommandations séparées par des virgules
                const recommendations = output.trim().split(',');
                // Traiter chaque recommandation
                recommendations.forEach(recommendation => {
                    processRecommendation(editor, recommendation.trim(), context);
                });
            }
            else {
                // En cas d'absence de recommandation du script Python, faire l'analyse de base
                basicAnalysis(editor, context);
            }
        });
    }
    else {
        // Analyse de base si nous n'avons pas assez d'états
        basicAnalysis(editor, context);
    }
}
function processRecommendation(editor, recommendation, context) {
    const doc = editor.document;
    const text = doc.getText();
    const lignes = text.split('\n');
    // Vider les diagnostics précédents avant d'en ajouter de nouveaux
    diagnosticCollection.clear();
    switch (recommendation) {
        case "Tabulation":
            // Trouver toutes les lignes qui commencent par 4 espaces
            let tabRanges = [];
            for (let i = 0; i < lignes.length; i++) {
                if (lignes[i].startsWith("    ")) {
                    // Surligner uniquement les 4 premiers espaces
                    const range = new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, 4));
                    tabRanges.push(range);
                }
            }
            // Reste de la logique pour les tabulations...
            if (tabRanges.length > 0) {
                highlightWithDiagnostic(editor, 'Tabulation', tabRanges);
            }
            break;
        case "CTRL+Shift+/":
            // Trouver toutes les lignes commentées
            let commentRanges = [];
            for (let i = 0; i < lignes.length; i++) {
                if (lignes[i].includes("#")) {
                    const commentPos = lignes[i].indexOf('#');
                    // Surligner uniquement le symbole #
                    const range = new vscode.Range(new vscode.Position(i, commentPos), new vscode.Position(i, commentPos + 1));
                    commentRanges.push(range);
                }
            }
            // Reste de la logique pour les commentaires...
            if (commentRanges.length > 0) {
                highlightWithDiagnostic(editor, 'CTRL+Shift+/', commentRanges);
            }
            break;
        // Autres cas...
    }
}
function basicAnalysis(editor, context) {
    const doc = editor.document;
    const text = doc.getText();
    const lignes = text.split('\n');
    // Analyse pour tabulations et commentaires (code existant)
    let tabRanges = [];
    for (let i = 0; i < lignes.length; i++) {
        if (lignes[i].startsWith("    ")) {
            const range = new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, 4));
            tabRanges.push(range);
        }
    }
    if (tabRanges.length > 0) {
        highlightWithDiagnostic(editor, 'Tabulation', tabRanges);
    }
    // Recherche de commentaires (#)
    let commentRanges = [];
    for (let i = 0; i < lignes.length; i++) {
        if (lignes[i].includes('#')) {
            const commentPos = lignes[i].indexOf('#');
            const range = new vscode.Range(new vscode.Position(i, commentPos), new vscode.Position(i, commentPos + 1));
            commentRanges.push(range);
        }
    }
    if (commentRanges.length > 0) {
        highlightWithDiagnostic(editor, 'CTRL+Shift+/', commentRanges);
    }
    // CTRL+A: NE PAS recommander automatiquement sans action utilisateur
    // Analyser uniquement si l'utilisateur a réellement fait une sélection
    const sel = editor.selection;
    const userHasSelection = !sel.isEmpty;
    if (userHasSelection &&
        sel.start.line === 0 &&
        sel.start.character === 0 &&
        sel.end.line === lignes.length - 1 &&
        sel.end.character === lignes[lignes.length - 1].length) {
        // Recommander CTRL+A seulement si l'utilisateur a fait une sélection manuelle qui couvre tout le document
        vscode.window.showInformationMessage(`Astuce : Utilisez CTRL+A pour sélectionner tout le texte`, 'Voir plus').then(selection => {
            if (selection === 'Voir plus') {
                updateRecommendationPanel('CTRL+A', context);
            }
        });
    }
    // Alt+↑/↓ : Nécessite une vérification plus fiable des déplacements de ligne
    if (etats_texte.length > 1 && etats_curseur.length > 1) {
        const lignesPrecedentes = etats_texte[etats_texte.length - 2].split('\n');
        const lignesActuelles = etats_texte[etats_texte.length - 1].split('\n');
        // Vérifier si c'est vraiment un déplacement de ligne et non une autre modification
        // Conditions strictes :
        // 1. Même nombre de lignes
        // 2. Même ensemble de lignes (mais ordre différent)
        // 3. Une seule ligne a été déplacée (pas plusieurs)
        // 4. Le déplacement est récent (position du curseur)
        const cursorPos = etats_curseur[etats_curseur.length - 1].position[0]; // ligne actuelle
        const prevCursorPos = etats_curseur.length > 1 ? etats_curseur[etats_curseur.length - 2].position[0] : -1;
        // Vérifier si c'est le même ensemble de lignes (ordre différent)
        const sameLines = lignesPrecedentes.length === lignesActuelles.length &&
            new Set([...lignesPrecedentes]).size === new Set([...lignesActuelles]).size &&
            lignesPrecedentes.join() !== lignesActuelles.join();
        // Vérifier si le curseur a changé de position en même temps qu'une ligne
        const cursorMoved = Math.abs(cursorPos - prevCursorPos) === 1;
        // Ne recommander que si c'est fort probable d'être un déplacement de ligne
        if (sameLines && cursorMoved) {
            // Trouver la ligne déplacée
            const movedLine = lignesActuelles[cursorPos];
            // Trouver l'ancien index de cette ligne
            const oldIndex = lignesPrecedentes.indexOf(movedLine);
            // Si la ligne s'est déplacée d'un seul cran
            if (Math.abs(oldIndex - cursorPos) === 1) {
                vscode.window.showInformationMessage(`Astuce : Utilisez Alt+↑/↓ pour déplacer des lignes`, 'Voir plus').then(selection => {
                    if (selection === 'Voir plus') {
                        updateRecommendationPanel('Alt+↑/↓', context);
                    }
                });
            }
        }
    }
}
function deactivate() {
    if (panel) {
        panel.dispose();
    }
    diagnosticCollection.clear();
    diagnosticCollection.dispose();
}
//# sourceMappingURL=extension%20copy.js.map