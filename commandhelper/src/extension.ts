// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "commandhelper" is now active!');

	vscode.window.onDidChangeTextEditorSelection((event: vscode.TextEditorSelectionChangeEvent) => {
		// Event kind : The change kind which has triggered this event. Can be undefined.
		// 1: Keyboard
		// 2: Mouse
		// 3: Command
		console.log(`Event kind : ${event.kind}`)

		// Event selection : The new value for the text editor's selections.
		// active : position of the cursor
		// anchor : position at which the selection starts
		// start : start position. It is before or equal to end.
		// end : end position. It is after or equal to start.
		console.log(`Event selection active (character:number, line:number): ${event.selections[0].active.character}, ${event.selections[0].active.line}`)
		console.log(`Event selection anchor (character:number, line:number): ${event.selections[0].anchor.character}, ${event.selections[0].active.line}`)

		// Event textEditor : The text editor for which the selections have changed.
		// Affiche le texte sélectionné
		var rangeOfSelection = new vscode.Range(event.selections[0].start, event.selections[0].end)
		console.log(`Event textEditor : ${event.textEditor.document.getText(rangeOfSelection)}`)


	}, null, context.subscriptions);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('commandhelper.readActiveFile', () => {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			// Get the content of the currently acive file
			const document = editor.document;

			// Get the text from the entire document 
			const fileContent = document.getText();

			// Show file content in a message box (just for demo)
			vscode.window.showInformationMessage('File Content:', fileContent.substring(0, 100)); // Just shows first 100 characters
        } else {
            vscode.window.showInformationMessage('No active editor found!');
		}

		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from commandHelper!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
