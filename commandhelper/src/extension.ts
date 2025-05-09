// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs, { readFile } from 'fs';
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



	// Récupération des raccourcis clavier de VS Code
	async function getCommandKeybindings(): Promise<Map<string, string>> {
		// Charger les raccourcis depuis le fichier keybindings.json
		const fileKeybindings = loadKeybindingsFromFile();

		// Si vous souhaitez compléter avec les raccourcis VSCode actuels:
		try {
			// Récupère tous les keybindings définis dans VSCode (si disponible)
			const vscodeKeybindingsCommand = await vscode.commands.getCommands(true)
				.then(commands => commands.find(cmd => cmd === 'getKeyBinding' || cmd === 'getKeyBindings'));

			if (vscodeKeybindingsCommand) {
				const allKeybindings = await vscode.commands.executeCommand(vscodeKeybindingsCommand);
				if (Array.isArray(allKeybindings)) {
					for (const binding of allKeybindings) {
						if (binding.command && (binding.key || binding.resolvedKeybinding)) {
							const keyString = binding.key || binding.resolvedKeybinding;
							if (!fileKeybindings.has(binding.command) && keyString) {
								fileKeybindings.set(binding.command, keyString);
							}
						}
					}
				}
			}
		} catch (error) {
			// Ignore les erreurs, on utilise uniquement les raccourcis du fichier
		}

		return fileKeybindings;
	}

	/**
	 * Charge les raccourcis clavier depuis le fichier keybindings.json
	 * @returns Une Map associant les commandes à leurs raccourcis
	 */
	function loadKeybindingsFromFile(): Map<string, string> {
		const keybindingsMap = new Map<string, string>();

		try {
			// Chemin vers le fichier keybindings.json
			const keybindingsPath = path.join(path.dirname(__dirname), 'media', 'keybindings.json');

			// Lecture du contenu du fichier
			const content = fs.readFileSync(keybindingsPath, 'utf8');

			// Supprimer les commentaires pour permettre le parsing JSON
			const jsonContent = content.replace(/\/\/.*$/gm, '');

			// Parser le JSON
			const keybindings = JSON.parse(jsonContent);

			// Parcourir tous les raccourcis et les ajouter à la Map
			for (const binding of keybindings) {
				if (binding.command && binding.key) {
					keybindingsMap.set(binding.command, binding.key);
				}
			}

			console.log(`Chargement des raccourcis terminé, ${keybindingsMap.size} raccourcis trouvés`);
		} catch (error) {
			console.error('Erreur lors du chargement des raccourcis:', error);
		}

		return keybindingsMap;
	}

	// Chargement des raccourcis clavier depuis le fichier et l'API VSCode
	const keybindingsMap = loadKeybindingsFromFile();

	// Compléter avec les raccourcis VSCode si disponibles
	getCommandKeybindings().then(map => {
		// Mise à jour de la map avec les nouvelles valeurs
		map.forEach((value, key) => keybindingsMap.set(key, value));

		// Mettre à jour le sidebarProvider avec les nouvelles valeurs
		sidebarProvider.updateKeybindings(keybindingsMap);
	});

	// Création du sidebar provider avec la map des keybindings initiale
	const sidebarProvider = new RecommendationsSidebarProvider(context.extensionUri, keybindingsMap);

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

			const banned_commands = sidebarProvider.getBannedList();
			const recommended = sidebarProvider.getRecommendations();

			// Envoi du nouvel état au serveur
			socket.send(JSON.stringify({
				'texte': liste_etats_texte,
				'curseur': liste_etats_curseur,
				'banned_commands': banned_commands
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