// Code serveur pour les simulations

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
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
        ws.on('message', (message) => {
            try {

                // Convertir le message en objet JSON
                const data = JSON.parse(message.toString());

                // Calcul des recommendations par simulation
                // const recommendations = simulate(data.texte, data.curseur, textEditor);
                if (data.texte.length > 0) {
                    ecrire_texte(data.texte[data.texte.length-1], textEditor);
                }

                // if (recommendations !== '') {
                //     // Envoi du résultat
                //     ws.send(recommendations);
                // }

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



function simulate(liste_etats_texte: string[], liste_etats_curseur: vscode.Selection[], textEditor: vscode.TextEditor | undefined) : string {


    /*______________________________________________________________________________________________*/


    const allCommands = async function listAllCommands() {
        return await vscode.commands.getCommands(true); // `true` inclut les commandes cachées
    }();
    
    console.log("Liste des commandes :\n", allCommands);
    
    // Écriture de la liste de toutes les commandes disponibles
    fs.writeFile("listeCommandes.txt", '', (err: any) => {
        if (err) {
            console.error("Erreur d'écriture :", err);
            return;
        }
        console.log("Fichier pour la liste des commandes créé !");
    });
    
    for (let command in allCommands) {
        fs.appendFile("listeCommandes.txt", command+'\n', (err: any) => {
            if (err) { throw err; }
        });
    }


    /*______________________________________________________________________________________________*/

        
    // Test seulement sur certaines commandes
    const commands = [
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
        const last_texte = liste_etats_texte[nb_etats-1];
        const last_cursor = liste_etats_curseur[nb_etats-1];

        // Parcours de tous les états du premier jusqu'à l'antépénultième
        for (let i=0; i<nb_etats-2; i++) {

            const current_texte = liste_etats_texte[i];
            const current_cursor = liste_etats_curseur[i];

            console.log("\n\nCurrent Texte :");
            console.log(current_texte);

            // Copie de l'état courant dans la fenêtre de simulation
            if (textEditor) {

                // Simulation des commandes
                for (let command of commands) {

                    // On écrit tout le texte
                    const fullRange = new vscode.Range(
                        textEditor.document.positionAt(0), // Début du fichier
                        textEditor.document.positionAt(textEditor.document.getText().length) // Fin du fichier
                    );
                
                    textEditor.edit(editBuilder => {
                        editBuilder.replace(fullRange, current_texte);
                    });

                    // On place le curseur
                    // const currentPositionAnchor = new vscode.Position(current_cursor.anchor.line, current_cursor.anchor.character);
                    // const currentPositionActive = new vscode.Position(current_cursor.active.line, current_cursor.active.character);
                    // textEditor.selection = new vscode.Selection(currentPositionAnchor, currentPositionActive);

                    // Exécution de la commande
                    // vscode.commands.executeCommand(command);

                    // Récupération de l'état obtenu
                    const new_texte = textEditor.document.getText();
                    const new_cursor = textEditor.selection;

                    // console.log("\n\nNew Cursor :");
                    // console.log(new_cursor);
                    // console.log("\n\nCurrent Cursor :");
                    // console.log(current_cursor);

                    console.log("\n\nNew Texte :");
                    console.log(new_texte);
                    console.log("\n\nLast Texte :");
                    console.log(last_texte);

                    // C'est le même état, on peut recommander la commande
                    // TODO : pour l'instant on ne compare que le texte
                    if (new_texte === last_texte) {
                        recommendations += command + '\n';
                    }

                    break;
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


// This method is called when your extension is deactivated
export function deactivate() { }
