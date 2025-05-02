
export const commandInfo: { [key: string]: { description: string; gifFile: string } } = {
    "Tabulation": { description: "Insère une tabulation", gifFile: "tab.gif" },
    "CTRL+Shift+/": { description: "Commente/décommente un bloc", gifFile: "ctrlshiftslash.gif" },
    "CTRL+Z": { description: "Annule la dernière action", gifFile: "ctrlZ.gif" },
    "CTRL+Y": { description: "Rétablit une action annulée", gifFile: "ctrlY.gif" },
  };
  
  export const commandInfoInvisible: { [key: string]: { description: string; gifFile: string } } = {
    "CTRL+A": { description: "Sélectionne tout le texte", gifFile: "ctrlA.gif" },
    "CTRL+D": { description: "Sélectionne l'occurrence suivante", gifFile: "ctrlD.gif" },
    "CTRL+Shift+K": { description: "Supprime la ligne courante", gifFile: "ctrlshiftK.gif" },
    "CTRL+Shift+L": { description: "Sélectionne toutes les occurrences", gifFile: "ctrlshiftL.gif" },
    "Alt+↑/↓": { description: "Déplace la ligne ou le bloc", gifFile: "alt.gif" },
  };