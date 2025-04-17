import * as vscode from 'vscode';
import { analyzeCurrentEditor, checkCtrlASelection, 
         checkForRemovedElements, saveEditorState } from './recommendation';
import { diagnosticCollection, disposePanel } from './affichage';

export function activate(context: vscode.ExtensionContext) {
    console.log('Command Helper extension is now active');
    
    // Exécuter l'analyse au démarrage
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
            
            // Sauvegarder l'état de l'éditeur
            saveEditorState(editor);
            
            // Analyser pour trouver des suggestions de raccourcis
            analyzeCurrentEditor(context);
        }
    }, null, context.subscriptions);
    
    // Observer les changements de sélection
    vscode.window.onDidChangeTextEditorSelection((e) => {
        if (e.textEditor === vscode.window.activeTextEditor) {
            // Vérifier spécifiquement les sélections de tout le document
            checkCtrlASelection(e.textEditor, context);
        }
    }, null, context.subscriptions);
    
    // Enregistrer la commande pour afficher la recommandation
    context.subscriptions.push(
        vscode.commands.registerCommand('commandhelper.showRecommendation', (recommendation) => {
            const { updateRecommendationPanel } = require('./affichage');
            updateRecommendationPanel(recommendation, context);
        })
    );

    // Enregistrer la commande manuelle
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.recommendShortcut', () => {
            analyzeCurrentEditor(context);
        })
    );

    // Ajouter le diagnosticCollection aux abonnements
    context.subscriptions.push(diagnosticCollection);
}

export function deactivate() {
    disposePanel();
    diagnosticCollection.clear();
    diagnosticCollection.dispose();
}
