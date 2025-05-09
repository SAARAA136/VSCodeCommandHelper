import * as vscode from 'vscode';

/**
 * Classe responsable de gérer le panneau latéral (Webview View)
 * Elle doit implémenter l'interface WebviewViewProvider
 */
export class RecommendationsSidebarProvider implements vscode.WebviewViewProvider {
  private recommandations: Array<{ enabled: boolean, name: string }>;
  private _webviewView: any;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this.recommandations = [];
    this._webviewView;
  }

  // Méthode pour ajouter un élément à l'array et mettre à jour la Webview
  addRecommandation(recommandation: string[]): boolean {
    var newRecommandation = false;
    for (var val of recommandation) {
      if (!this.recommandations.map(command => command.name).includes(val) && (val !== '')) {
        this.recommandations.push({ name: val, enabled: true });
        this.updateCommandList(); // Appel pour mettre à jour la liste des commandes dans la Webview
        newRecommandation = true;
      }
    }
    return newRecommandation;
  }

  // Méthode pour obtenir la liste des recommandations
  getRecommendations(): Array<{ enabled: boolean, name: string }> {
    return this.recommandations;
  }

  // Méthode pour envoyer les données à la Webview pour mise à jour
  private updateCommandList(): void {
    // Assurez-vous que nous avons une Webview avant d'envoyer des messages
    if (this._webviewView) {
      this._webviewView.webview.postMessage({
        type: 'updateCommands',
        data: this.getRecommendations()
      });
    }
  }

  /**
   * Méthode appelée automatiquement par VSCode lorsqu'il faut afficher la Webview View
   */
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    // Sauvegarder la référence de la Webview pour la mise à jour
    this._webviewView = webviewView;

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

    // Gestion de la réception de messages depuis le JavaScript de la Webview
    webviewView.webview.onDidReceiveMessage(message => {
      if (message.type === 'toggleCommand') {
        const { commandName, status } = message;
        // Traitement du changement d'état d'une commande
        console.log(`Commande ${commandName} => ${status}`);
        const command = this.recommandations.find(command => command.name === commandName);
        if (command) {
          command.enabled = status;
        }
      }
    });

    // Envoi initial des données vers la Webview (la liste des commandes recommandées)
    webviewView.webview.postMessage({ type: 'updateCommands', data: this.getRecommendations() });
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
