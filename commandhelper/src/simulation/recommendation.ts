// Représentation de la position d'un curseur sous forme de tuple (ligne, colonne)
export type Position = [number, number];

// Représentation de l'état d'un curseur par sa position courante, la position du
// début de la sélection et la position de la fin de la sélection
export type CursorState = {
	position:Position,
	start:Position,
	end:Position
};

// Listes représentant les états
export let liste_etats_texte: string[] = [];
export let liste_etats_curseur: CursorState[] = [];

export function recommend() : string {

    console.log(liste_etats_texte);

    if (liste_etats_texte[liste_etats_texte.length-1].includes("bonjour")) {
        return "BONJOUR";
    }

    return '';
}