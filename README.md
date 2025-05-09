# VSCodeCommandHelper - Projet AI2D

VSCodeCommandHelper est une extension pour VS Code qui assiste les développeurs en suggérant les commandes les plus optimales selon le contexte et les actions effectuées. Ce projet combine IA, développement logiciel et IHM pour améliorer l’expérience utilisateur et optimiser l’usage des fonctionnalités de l’éditeur.
Ce projet est encadré par Gilles Bailly et Julien Gori.

## Utilisation

L'exécution du projet de recommandation nécessite d'avoir un terminal bash avec les droits d'exécution ainsi que Node.js et VSCode sous une version récente. Pour les utilisateurs de MAC, il faut installer la commande 'code' pour pouvoir lancer la commande.

Le projet est découpé en 3 extensions :

1. Une extension pour un affichage "avancé" mais pour quelques commandes basiques;
2. Une extension plus générique avec un affichage "simple" qui peut recommander un nombre arbitraire de commandes;
3. Une extension pour la simulation des commandes nécessaire au fonctionnement de l'extension générique.

Avant de pouvoir utiliser l'extension, il faut les installer. Placez-vous dans le dossier __VSCodeCommandHelper__ et entrez :

    ./install

### Extension affichage avancé

Placez-vous dans le répertoire *VSCodeCommandHelper* et lancez la commande :

    code commandhelper-rules

Cela ouvre une fenêtre VSCode. Déplacez-vous dans le fichier *extension.ts* puis appuyez sur la touche F5. Cela active l'extension en ouvrant une nouvelle fenêtre dans laquelle l'utilisateur peut écrire du texte ou code et le système recommandera certaines commandes potentiellement intéressantes pour ce dernier.

Pour recommencer une simulation, il faut redémarrer l'extension en refaisant F5 depuis le fichier *extension.ts*

### Extension générique par simulation

Lorsque l'utilisateur modifie le fichier sur lequel il travaille (changement de position du curseur et modification du texte), un nouvel état est crée. L'approche par simulation consiste à recréer chacun de ces états dans une fenêtre VSCode dédiée (*simulation*) puis d'exécuter chaque commande à tester, comparer le résultat avec l'état courant dans la fenêtre sur laquelle travaille l'utilisateur (*commandhelper*) puis recommander la commande s'il les états sont les même.

Placez-vous dans le répertoire *VSCodeCommandHelper* et lancez la commande :

    ./start
    
Cela ouvre deux fenêtres, une pour la simulation des commandes et une pour l'éditeur principal de l'utilisateur (celui dans lequel l'utilisateur va travailler). Placez vous dans la fenêtre *simulation*, puis placez-vous dans le fichier *extension.ts* et entrez la touche F5 qui ouvre la fenêtre de "debug" pour la simulation. Il se peut qu'on vous demande quel extension de debug vous voulez utiliser, il faut sélectionner "VS Code Extension Development".

Placez vous ensuite dans la fenêtre *commandhelper*, puis placez-vous dans le fichier *extension.ts* et entrez la touche F5. La nouvelle fenêtre de debug qui s'ouvre servira d'environnement de travail pour l'utilisateur dans laquelle il pourra écrire le texte ou code qu'il veut et le système recommendera éventuellement des commandes qui pourrait améliorer son expérience et sa productivité.

Lorsque qu'une commande a été trouvée pour être recommandée, une fenêtre pop-up s'affiche avec le nom de la commande et un bouton cliquable "Voir". Si l'utilisateur clique sur ce bouton, un panneau latéral s'ouvre avec les différentes commandes qui ont déjà été recommandées sous forme de liste de cases à cocher. Lorsque l'on décoche la case d'une commande, le système arrête de la recommander et lorsque la coche de nouveau il la recommande de nouveau.

Plus l'utilisateur va écrire du texte, plus le temps de simulation va être long (voir Rapport). Pour recommencer une simulation, il faut redémarrer l'extension en refaisant F5 depuis le fichier *extension.ts* de *simulation* **puis** F5 depuis le fichier *extension.ts* de *commandhelper*.
