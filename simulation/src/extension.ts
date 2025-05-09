// Code serveur pour les simulations

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { truncateSync } from 'fs';
import * as vscode from 'vscode';
import { WebSocketServer } from 'ws';

// Pour les opérations IO
const fs = require('fs');



/*********************
 * MAIN DE L'EXTENSION
 *********************/



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const textEditor = vscode.window.activeTextEditor;

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "simulation" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('simulation.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Démarrage du serveur !');
    });

    context.subscriptions.push(disposable);



    /******************************
     * COMMUNICATION VIA WEBSOCKETS
     ******************************/



    const PORT = 9999;
    const server = new WebSocketServer({ port: PORT });

    server.on('connection', (ws) => {
        console.log('Nouvelle connexion WebSocket établie.');

        // L'extension envoie une requête pour la simulation avec la liste des
        // états
        ws.on('message', async (message) => {
            try {

                // Convertir le message en objet JSON
                const data = JSON.parse(message.toString());
                // Calcul des recommendations par simulation
                const recommendations = await simulate(data.texte, data.curseur, data.banned_commands, textEditor, false);

                if (recommendations !== '') {
                    // Envoi du résultat
                    ws.send(recommendations);
                }

            } catch (error) {
                ws.send(JSON.stringify({ erreur: 'Format JSON invalide' }));
            }
        });

        ws.on('close', () => {
            console.log('Connexion fermée.');
        });
    });

    console.log(`Serveur WebSocket démarré sur ws://localhost:${PORT}`);

}



/**************************
* SIMULATION DES COMMANDES
**************************/



async function simulate(liste_etats_texte: string[],
    liste_etats_curseur: vscode.Selection[],
    banned_commands: string[],
    textEditor: vscode.TextEditor | undefined,
    allCommands: boolean): Promise<string> {

    let commands: string[] = [];

    // Test sur toutes les commandes
    if (allCommands) {
        // Lecture du fichier contenant les commandes
        commands = await readAllCommands('./editorCommands.txt');
    }
    // Test seulement sur certaines commandes
    else {
        commands = [
            'tab',
            'editor.action.selectAll',
            'editor.action.commentLine',
            'editor.action.moveLinesUpAction',
            'editor.action.moveLinesDownAction',
            'editor.action.selectHighlights',
            'undo',
            'redo',
            'editor.action.addSelectionToNextFindMatch',
            'editor.action.deleteLines'
        ];
    }

    let recommendations: string = "";
    const nb_etats = liste_etats_curseur.length;

    // On ne fait la simulation qu'à partir de 3 états
    if (nb_etats > 2) {

        if (nb_etats !== liste_etats_texte.length) {
            throw new Error(`La liste des états du curseur (${nb_etats})\
                et la liste des états du texte (${liste_etats_texte.length}) ne sont pas de\
                 la même longueur`);
        }

        // On récupère le dernier état avec lequel on va faire la comparaison
        const last_texte = liste_etats_texte[nb_etats - 1];
        const last_cursor = liste_etats_curseur[nb_etats - 1];

        // Parcours de tous les états du premier jusqu'à l'antépénultième
        for (let i = 0; i < nb_etats - 2; i++) {

            const current_texte = liste_etats_texte[i];
            const current_cursor = liste_etats_curseur[i];

            // Copie de l'état courant dans la fenêtre de simulation
            if (textEditor) {

                // Simulation des commandes
                for (let command of commands) {

                    // On écrit tout le texte
                    const fullRange = new vscode.Range(
                        textEditor.document.positionAt(0), // Début du fichier
                        textEditor.document.positionAt(textEditor.document.getText().length) // Fin du fichier
                    );

                    await textEditor.edit(editBuilder => {
                        editBuilder.replace(fullRange, current_texte);
                    });

                    // On place le curseur
                    const currentPositionAnchor = new vscode.Position(current_cursor.anchor.line, current_cursor.anchor.character);
                    const currentPositionActive = new vscode.Position(current_cursor.active.line, current_cursor.active.character);
                    textEditor.selection = new vscode.Selection(currentPositionAnchor, currentPositionActive);

                    const isInList = banned_commands.includes(command);
                    if (isInList !== true) {
                        // Exécution de la commande
                        await vscode.commands.executeCommand(command);
                        console.log(command);
                    }

                    // Récupération de l'état obtenu
                    const new_texte = textEditor.document.getText();
                    const new_cursor = textEditor.selection;

                    // On regarde s'il y a eu un changement à l'issue de l'exécution
                    // de la commande
                    if (new_texte !== current_texte || compareCursorState(new_cursor, current_cursor) === false) {
                        // C'est le même état, on peut recommander la commande
                        if (new_texte === last_texte && compareCursorState(new_cursor, last_cursor)) {
                            recommendations += command + '\n';
                        }
                    }
                }
            }
        }
    }

    return recommendations;
}


function ecrire_texte(texte: string, textEditor: vscode.TextEditor | undefined) {

    if (textEditor) {
        // On écrit tout le texte
        const fullRange = new vscode.Range(
            textEditor.document.positionAt(0), // Début du fichier
            textEditor.document.positionAt(textEditor.document.getText().length) // Fin du fichier
        );

        textEditor.edit(editBuilder => {
            editBuilder.replace(fullRange, texte);
        });
    }
}

/**
 * Permet de comparer deux états de curseur.
 * @param state1 Le premier état à comparer.
 * @param state2 Le deuxième état à comparer.
 * @returns true si ce sont les même états et false sinon.
 */
function compareCursorState(state1: vscode.Selection, state2: vscode.Selection): boolean {


    if (state1.start.line !== state2.start.line || state1.start.character !== state2.start.character) {
        return false;
    }

    if (state1.end.line !== state2.end.line || state1.end.character !== state2.end.character) {
        return false;
    }

    return true;
}

function afficheCursor(cursor: vscode.Selection) {
    return `start (${cursor.start.line}, ${cursor.start.character}) - end (${cursor.end.line}, ${cursor.end.character})`;
}

async function writeAllCommands(nomFichier: string) {

    const allCommands = await vscode.commands.getCommands(true); // `true` retire les commandes systèmes
    console.log("Liste des commandes :\n", allCommands);

    // Écriture de la liste de toutes les commandes disponibles
    fs.writeFile(nomFichier, '', (err: any) => {
        if (err) {
            console.error("Erreur d'écriture :", err);
            return;
        }
        console.log("Fichier pour la liste des commandes créé !");
    });

    fs.writeFileSync(nomFichier, allCommands.join('\n'), 'utf8');
}

async function readAllCommands(nomFichier: string): Promise<string[]> {

    let data: string = "";

    try {
        data = fs.readFileSync(nomFichier, 'utf8');
    } catch (err) {
        console.error(err);
    }

    return data.split('\n');
}


// This method is called when your extension is deactivated
export function deactivate() { }