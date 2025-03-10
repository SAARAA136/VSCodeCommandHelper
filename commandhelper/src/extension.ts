// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs from 'fs';
import { spawn } from 'child_process';
import { json } from 'stream/consumers';

// Représentation de la position d'un curseur sous forme de tuple (ligne, colonne)
type Position = [number, number];

// Représentation de l'état d'un curseur par sa position courante, la position du
// début de la sélection et la position de la fin de la sélection
type CursorState = {
	position:Position,
	start:Position,
	end:Position
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const editor = vscode.window.activeTextEditor;

	// On initialise la liste des états
	let liste_etats_texte: string[] = [];
	let liste_etats_curseur: CursorState[] = [];
	let etats = {
		"etats_texte": liste_etats_texte,
		"etats_curseur": liste_etats_curseur
	};

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

	// Événement déclenché quand l'utilisateur modifie le texte
    // let changeListener = vscode.workspace.onDidChangeTextDocument(event => {
    const changeListener = vscode.workspace.onDidChangeTextDocument(event => {
        if (editor && event.document === editor.document) {
			const document = editor.document;
			const text = document.getText();
			
			// On ajoute le nouvel état
			liste_etats_texte.push(text);
			const jsonString = JSON.stringify(etats);

			// Exécution du script Python pour la recommandation
			const pythonProcess = spawn('python', ['src/recommendation.py', jsonString]);

			pythonProcess.stdout.on('data', (data) => {
				vscode.window.showInformationMessage(`Commande recommandée : ${data}`);
			});

			pythonProcess.stderr.on('data', (data) => {
				console.error(`(TypeScript) Erreur Python : ${data}`);
			});
        }
    });

	// Évènement qui se déclenche lorsque l'utilisateur déplace la souris ou change la sélection
	const selectionListener = vscode.window.onDidChangeTextEditorSelection(event => {
        if (event.textEditor === vscode.window.activeTextEditor) {

			// Position actuelle du curseur
            const position = event.selections[0].active;

			// Position du début de la sélection
			const start = event.selections[0].start;

			// Position de la fin de la sélection
			const end = event.selections[0].end;

			liste_etats_curseur.push({
				position: [position.line, position.character],
				start: [start.line, start.character],
				end: [end.line, end.character]
			});

			const jsonString = JSON.stringify(etats);

			// Exécution du script Python pour la recommandation
			const pythonProcess = spawn('python', ['src/recommendation.py', jsonString]);

			pythonProcess.stdout.on('data', (data) => {
				vscode.window.showInformationMessage(`Commande recommandée : ${data}`);
				console.log(`Sortie Python : ${data}`);
			});

			pythonProcess.stderr.on('data', (data) => {
				console.error(`(TypeScript) Erreur Python : ${data}`);
			});
        }
    });

	context.subscriptions.push(disposable, changeListener, selectionListener);
}

export function commentLine() {
	vscode.commands.executeCommand('editor.action.addCommentLine');
}

// This method is called when your extension is deactivated
export function deactivate() {}
