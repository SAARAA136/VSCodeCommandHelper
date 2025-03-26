// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs from 'fs';
import { spawn } from 'child_process';
import { json } from 'stream/consumers';

// Liste des états
import { liste_etats_curseur, liste_etats_texte, recommend } from './simulation/recommendation';

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

	// Évènement qui se déclenche lorsque l'utilisateur déplace la souris ou change la sélection
	const selectionListener = vscode.window.onDidChangeTextEditorSelection(event => {
        if (event.textEditor === vscode.window.activeTextEditor && editor) {

			const document = editor.document;
			const text = document.getText();
			
			// On ajoute le nouvel état texte
			liste_etats_texte.push(text);

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

			// On affiche ce qui est recommandé
			let res = recommend();

			if (res !== '') {
				console.log("On entre dans le if");
				vscode.window.showInformationMessage(res);
				vscode.commands.executeCommand('vscode.diff');
			}
        }
    });

	context.subscriptions.push(disposable, selectionListener);
}

// This method is called when your extension is deactivated
export function deactivate() {}