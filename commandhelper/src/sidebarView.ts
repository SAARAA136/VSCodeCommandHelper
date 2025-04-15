// Import des modules nécessaires
import * as vscode from 'vscode';
import { getRecommendations } from './data'; // Fonction fictive qui retourne les commandes recommandées

/**
 * Classe responsable de gérer le panneau latéral (Webview View)
 * Elle doit implémenter l'interface WebviewViewProvider
 */
export class RecommendationsSidebarProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  /**
   * Méthode appelée automatiquement par VSCode lorsqu'il faut afficher la Webview View
   */
  resolveWebviewView(
    webviewView: vscode.WebviewView,                 // L'objet qui représente la Webview dans l'UI
    _context: vscode.WebviewViewResolveContext,      // Contexte de résolution (peu utilisé ici)
    _token: vscode.CancellationToken                 // Permet d'annuler si nécessaire
  ) {
    // Configuration de la Webview : autorisation du JavaScript et accès aux ressources locales
    webviewView.webview.options = {
      enableScripts: true, // Permet l'exécution de scripts JS dans la Webview
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')] // Dossier autorisé pour les ressources
    };

    // Génération des URI utilisables dans le HTML (compatibles avec la sandbox VSCode)
    const scriptUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
    );

    const styleUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css')
    );

    // On injecte le contenu HTML dans la Webview
    webviewView.webview.html = this._getHtmlForWebview(scriptUri, styleUri);

    /**
     * Gestion de la réception de messages depuis le JavaScript de la Webview
     * Par exemple : quand l'utilisateur coche ou décoche une commande
     */
    webviewView.webview.onDidReceiveMessage(message => {
      if (message.type === 'toggleCommand') {
        const { command, enabled } = message;

        // Traitement du changement d'état d'une commande
        // (ici, simple affichage dans la console ; à remplacer par une logique de persistance)
        console.log(`Commande ${command} => ${enabled}`);
      }
    });

    // Envoi initial des données vers la Webview (la liste des commandes recommandées)
    webviewView.webview.postMessage({ type: 'init', data: getRecommendations() });
  }

  /**
   * Génère dynamiquement le contenu HTML à afficher dans la Webview
   * @param scriptUri URI vers le fichier JavaScript
   * @param styleUri URI vers le fichier CSS
   */
  private _getHtmlForWebview(scriptUri: vscode.Uri, styleUri: vscode.Uri): string {
    return /* html */ `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet" />
        <title>Commandes recommandées</title>
      </head>
      <body>
        <h2>Commandes recommandées</h2>
        <div id="command-list"></div> <!-- Conteneur dynamique -->
        <script src="${scriptUri}"></script> <!-- Script qui gère l'affichage et l'interaction -->
      </body>
      </html>
    `;
  }
}
