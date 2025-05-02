import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';
import { highlightWithDiagnostic, diagnosticCollection } from './affichage';
import { clearAllDecorations, updateDecorations, 
         activeTabDecorations, activeCommentDecorations } from './highlightManager';

// Types
type Position = [number, number];
type CursorState = {
    position: Position;
    start: Position;
    end: Position;
};

// États
export let etats_texte: string[] = [];
export let etats_curseur: CursorState[] = [];

// Fonction pour sauvegarder l'état de l'éditeur
export function saveEditorState(editor: vscode.TextEditor) {
    const text = editor.document.getText();
    if (etats_texte.length === 0 || etats_texte[etats_texte.length - 1] !== text) {
        etats_texte.push(text);
        // Ne conserver que les 5 derniers états
        if (etats_texte.length > 5) {
            etats_texte.shift();
        }
    }
    
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
}

// Fonction principale d'analyse
export function analyzeCurrentEditor(context: vscode.ExtensionContext) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {return;}
    
    // Vider les diagnostics précédents
    diagnosticCollection.clear();
    
    // Effacer les décorations
    clearAllDecorations(editor);
    
    // Si on a assez d'états, utiliser Python pour l'analyse avancée
    if (etats_texte.length > 1 && etats_curseur.length > 0) {
        const pythonProcess = spawn('python', [
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
                const recommendations = output.trim().split(',');
                recommendations.forEach(recommendation => {
                    processRecommendation(editor, recommendation.trim(), context);
                });
            } else {
                basicAnalysis(editor, context);
            }
        });
    } else {
        basicAnalysis(editor, context);
    }
}

// Traite une recommandation spécifique
export function processRecommendation(editor: vscode.TextEditor, recommendation: string, context: vscode.ExtensionContext) {
    const doc = editor.document;
    const text = doc.getText();
    const lignes = text.split('\n');
    
    switch (recommendation) {
        case "Tabulation":
            let tabRanges: vscode.Range[] = [];
            for (let i = 0; i < lignes.length; i++) {
                if (lignes[i].startsWith("    ")) {
                    const range = new vscode.Range(
                        new vscode.Position(i, 0), 
                        new vscode.Position(i, 4)
                    );
                    tabRanges.push(range);
                }
            }
            
            if (tabRanges.length > 0) {
                highlightWithDiagnostic(editor, 'Tabulation', tabRanges);
            }
            break;
            
        case "CTRL+Shift+/":
            let commentRanges: vscode.Range[] = [];
            for (let i = 0; i < lignes.length; i++) {
                if (lignes[i].includes("#")) {
                    const commentPos = lignes[i].indexOf('#');
                    const range = new vscode.Range(
                        new vscode.Position(i, commentPos), 
                        new vscode.Position(i, commentPos + 1)
                    );
                    commentRanges.push(range);
                }
            }
            
            if (commentRanges.length > 0) {
                highlightWithDiagnostic(editor, 'CTRL+Shift+/', commentRanges);
            }
            break;
    }
}

// Analyse de base des raccourcis clavier
export function basicAnalysis(editor: vscode.TextEditor, context: vscode.ExtensionContext) {
    const doc = editor.document;
    const text = doc.getText();
    const lignes = text.split('\n');
    
    // Analyse des tabulations
    let tabRanges: vscode.Range[] = [];
    for (let i = 0; i < lignes.length; i++) {
        if (lignes[i].startsWith("    ")) {
            const range = new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, 4));
            tabRanges.push(range);
        }
    }
    
    if (tabRanges.length > 0) {
        highlightWithDiagnostic(editor, 'Tabulation', tabRanges);
    }

    // Analyse des commentaires
    let commentRanges: vscode.Range[] = [];
    for (let i = 0; i < lignes.length; i++) {
        if (lignes[i].includes('#')) {
            const commentPos = lignes[i].indexOf('#');
            const range = new vscode.Range(
                new vscode.Position(i, commentPos),
                new vscode.Position(i, commentPos + 1)
            );
            commentRanges.push(range);
        }
    }
    
    if (commentRanges.length > 0) {
        highlightWithDiagnostic(editor, 'CTRL+Shift+/', commentRanges);
    }
    
    // Autres analyses... (raccourcis comme Alt+↑/↓, etc.)
    // Exemple pour Alt+↑/↓
    let altUpDownRanges: vscode.Range[] = [];
    for (let i = 0; i < lignes.length; i++) {
        if (lignes[i].includes('Alt+↑') || lignes[i].includes('Alt+↓')) {
            const range = new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, lignes[i].length));
            altUpDownRanges.push(range);
        }
    }
    if (altUpDownRanges.length > 0) {
        highlightWithDiagnostic(editor, 'Alt+↑/↓', altUpDownRanges);
    }
    // Autres analyses...
}

// Vérification spécifique pour CTRL+A
export function checkCtrlASelection(editor: vscode.TextEditor, context: vscode.ExtensionContext) {
    const doc = editor.document;
    const text = doc.getText();
    const lignes = text.split('\n');
    const sel = editor.selection;
    
    const isFullSelection = 
        !sel.isEmpty && 
        sel.start.line === 0 && 
        sel.start.character === 0 && 
        sel.end.line === lignes.length - 1 && 
        sel.end.character >= lignes[lignes.length - 1].length;
    
    if (isFullSelection) {
        const now = new Date().getTime();
        if (!checkCtrlASelection.lastNotificationTime || 
            (now - checkCtrlASelection.lastNotificationTime) > 3000) {
            
            checkCtrlASelection.lastNotificationTime = now;
            
            vscode.window.showInformationMessage(
                `Astuce : Utilisez CTRL+A pour sélectionner tout le texte`,
                'Voir plus'
            ).then(selection => {
                if (selection === 'Voir plus') {
                    const { updateRecommendationPanel } = require('./affichage');
                    updateRecommendationPanel('CTRL+A', context);
                }
            });
        }
    }
}
checkCtrlASelection.lastNotificationTime = 0;

// Vérification des éléments supprimés
export function checkForRemovedElements(editor: vscode.TextEditor, changes: readonly vscode.TextDocumentContentChangeEvent[], context: vscode.ExtensionContext) {
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
                    updateDecorations(editor, 'Tabulation', 
                        activeTabDecorations.filter(d => 
                            d.range.start.line !== change.range.start.line
                        )
                    );
                }
                
                // Pour les commentaires
                if (!lineText.includes("#")) {
                    updateDecorations(editor, 'CTRL+Shift+/', 
                        activeCommentDecorations.filter(d => 
                            d.range.start.line !== change.range.start.line
                        )
                    );
                }
                
                analyzeCurrentEditor(context);
            }
        }
    }
}