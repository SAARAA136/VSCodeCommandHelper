# VSCodeCommandHelper - Projet AI2D

VSCodeCommandHelper est une extension pour VS Code qui assiste les développeurs en suggérant les commandes les plus optimales selon le contexte et les actions effectuées. Ce projet combine IA, développement logiciel et IHM pour améliorer l’expérience utilisateur et optimiser l’usage des fonctionnalités de l’éditeur.

> Ce projet est encadré par **Gilles Bailly** et **Julien Gori**.

## Prérequis et installation

L'exécution du projet nécessite :

- Un terminal bash avec les droits d’exécution,
- Node.js installé,
- Une version récente de Visual Studio Code.

> Utilisateurs Mac : Veillez à avoir la commande code disponible dans votre terminal (via la palette de commande : Shell Command: Install 'code' command in PATH).

Le projet se compose de trois extensions :

1. Une extension avec un affichage **avancé** pour quelques commandes basiques ;

2. Une extension plus **générique** avec un affichage simple, capable de recommander un nombre arbitraire de commandes ;

3. Une extension dédiée à la **simulation** des commandes, nécessaire au fonctionnement de l’extension générique.

## Installation (IMPORTANT)

Depuis le répertoire racine `VSCodeCommandHelper`, exécutez la commande suivante :

    ./install

## Utilisation des extensions

### 1. Extension à  affichage avancé

Depuis le dossier `VSCodeCommandHelper`, lancez :

    code commandhelper-rules

Une fenêtre VS Code s’ouvre. Ouvrez ensuite le fichier `extension.ts` dans le dossier `src`, puis appuyez sur **F5** pour activer l’extension. Si une sélection vous est proposée, choisissez "VS Code Extension Development". Une nouvelle fenêtre s’ouvre, dans laquelle l’utilisateur peut écrire du texte ou du code : le système proposera alors certaines commandes potentiellement utiles.

> Testez sur 4 espaces en début de ligne et sélectionnez tout le texte de l'éditeur.
> Pour redémarrer une simulation, relancez **F5** depuis le fichier extension.ts.

### 2. Extension générique par simulation

L’approche par simulation consiste à :

- Créer un nouvel état à chaque modification (déplacement du curseur ou modification du texte),

- Reproduire cet état dans une fenêtre dédiée (simulation),

- Exécuter les commandes à tester et comparer leur effet avec l’état de la fenêtre de travail (commandhelper),

- Recommander la commande si les états correspondent.

**Lancement :**

Depuis le dossier `VSCodeCommandHelper`, exécutez :

    ./start
    
Cela ouvre deux fenêtres :

- Une fenêtre simulation pour rejouer les commandes à tester.

- Une fenêtre commandhelper dans laquelle l’utilisateur travaille.

**Étapes :**

1. Dans la fenêtre simulation, ouvrez le fichier `extension.ts`dans le dossier `src` et appuyez sur F5 pour lancer la fenêtre de débogage.

- Si une sélection vous est proposée, choisissez "VS Code Extension Development".

2. Dans la fenêtre commandhelper, ouvrez également `extension.ts` dans le dossier `src`, puis appuyez sur F5. Lorsque la fenêtre s'ouvre, faites `Ctrl+shit+P` qui ouvrira le panel de commande et tapez `Command Helper`, puis entrer.

- La nouvelle fenêtre qui s’ouvre sera l’environnement de travail de l’utilisateur, dans lequel il pourra écrire librement.

Lorsque le système identifie une commande pertinente, une fenêtre pop-up s’affiche avec :

- Le nom de la commande,

- Un bouton "Voir".

En cliquant sur "Voir", un panneau latéral s’ouvre avec la **liste des commandes recommandées** (cases à cocher).

- Décochez une commande pour **cesser sa recommandation**,

- Recochez-la pour **la réactiver**.

> Attention : plus l’utilisateur écrit, plus la simulation peut devenir longue (voir le rapport pour plus de détails).

**Redémarrage de la simulation :**

Pour redémarrer la simulation, répétez la séquence suivante :

1. F5 dans le fichier `extension.ts` de **simulation**,

2. Puis F5 dans le fichier `extension.ts` de **commandhelper**.
