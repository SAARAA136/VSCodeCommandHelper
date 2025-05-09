// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { json } from 'stream/consumers';
import { WebSocket } from 'ws';

// Import du fournisseur de Webview View (c'est le panneau latéral)
import { RecommendationsSidebarProvider } from './sidebarView';

/******************************
 * COMMUNICATION VIA WEBSOCKETS
 ******************************/



const PORT = 9999;
const socket = new WebSocket(`ws://localhost:${PORT}`);

socket.onopen = () => {
	console.log('Connecté au serveur WebSocket');
	socket.send('Hello serveur !');
};

socket.onclose = () => {
	console.log('Connexion WebSocket fermée.');
};

socket.onerror = (error) => {
	console.error('Erreur WebSocket:', error);
};



/*********************
 * MAIN DE L'EXTENSION
 *********************/



// Liste des états
import { liste_etats_curseur, liste_etats_texte } from './recommendation';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const editor = vscode.window.activeTextEditor;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "command-helper" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('command-helper.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Command Helper!');
	});



	/***************************
	* AJOUT CODE PANNEAU LATÉRAL
	****************************/



	// TODO


	// Création d'une instance du fournisseur de la vue latérale
	const sidebarProvider = new RecommendationsSidebarProvider(context.extensionUri);

	// Enregistrement du Webview View Provider auprès de VSCode
	// Cela permet de connecter notre vue "recommendedCommands" définie dans package.json
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'recommendedCommands',  // ID de la vue, doit correspondre à celui défini dans package.json
			sidebarProvider         // Le fournisseur qui gère cette vue
		)
	);

	// Enregistrement de la commande "Afficher les recommandations"
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.showRecommendationsPopup', (commande: string) => {
			const recommandations = commande.split("\n");
			console.log('nouvelle recommandation');

			console.log(recommandations);
			sidebarProvider.addRecommandation(recommandations);
			// Affiche une boîte de message avec un bouton "Voir"
			vscode.window.showInformationMessage(
				`Des commandes vous sont recommandées : ${recommandations[0]}`,
				'Voir'
			).then(selection => {
				if (selection === 'Voir') {
					// Si l'utilisateur clique sur "Voir", on affiche le panneau latéral
					vscode.commands.executeCommand('workbench.view.extension.recommendations-sidebar');
				}
			});
		})
	);

	/**********************
	* MISE À JOUR DES ÉTATS
	***********************/



	// Évènement qui se déclenche lorsque l'utilisateur déplace la souris ou change la sélection
	const selectionListener = vscode.window.onDidChangeTextEditorSelection(event => {
		if (event.textEditor === vscode.window.activeTextEditor && editor) {

			const document = editor.document;
			const text = document.getText();

			// On ajoute le nouvel état texte
			liste_etats_texte.push(text);

			// Position actuelle du curseur
			const selections = event.selections;

			if (selections.length > 1) {
				console.log("Plusieurs sélections actives !");
			}

			liste_etats_curseur.push(selections[0]);

			// On affiche ce qui est recommandé

			// Envoi du nouvel état au serveur
			socket.send(JSON.stringify({
				'texte': liste_etats_texte,
				'curseur': liste_etats_curseur
			}));

			// On reçoit une recommendation
			socket.onmessage = (event) => {
				// Convertir la réponse JSON en objet
				const response = event.data;

				vscode.commands.executeCommand('extension.showRecommendationsPopup', `${response}`);

				const filePath = path.join(__dirname, 'log');
				const line = `${response}`;
			};
		}
	});

	context.subscriptions.push(disposable, selectionListener);
}

// This method is called when your extension is deactivated
export function deactivate() { }