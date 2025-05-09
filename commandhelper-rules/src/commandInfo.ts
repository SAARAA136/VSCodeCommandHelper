
export const commandInfo: { [key: string]: { description: string; gifFile: string } } = {
  "Tabulation": { description: "Indente la ligne actuelle ou insère une tabulation à l'emplacement du curseur. Utile pour structurer le code de manière lisible.", gifFile: "tab.gif" },
  "CTRL+Shift+:": { description: "Commente ou décommente en bloc les lignes sélectionnées selon la syntaxe du langage utilisé.", gifFile: "ctrlshiftslash.gif" },
  "CTRL+Z": { description: "Annule la dernière action effectuée (rétroaction). Peut être utilisé plusieurs fois pour revenir à un état antérieur.", gifFile: "ctrlZ.gif" },
  "CTRL+Y": { description: "Rétablit une action annulée précédemment avec Ctrl + Z. Revenir en avant dans l’historique des modifications.", gifFile: "ctrlY.gif" },
};

export const commandInfoInvisible: { [key: string]: { description: string; gifFile: string } } = {
  "CTRL+A": { description: "Sélectionne tout le contenu du fichier ou de l’éditeur actif.", gifFile: "ctrlA.gif" },
  "CTRL+D": { description: "Sélectionne la prochaine occurrence du mot ou de la sélection courante. Utile pour modifier plusieurs éléments similaires simultanément.", gifFile: "ctrlD.gif" },
  "CTRL+Shift+K": { description: "Supprime la ligne actuelle sans avoir à la sélectionner manuellement.", gifFile: "ctrlshiftK.gif" },
  "CTRL+Shift+L": { description: "Sélectionne toutes les occurrences du mot ou de la sélection actuelle dans le document pour édition simultanée.", gifFile: "ctrlshiftL.gif" },
  "Alt+↑/↓": { description: "Déplace la ligne actuelle ou les lignes sélectionnées vers le haut ou vers le bas, tout en conservant l’indentation et la logique du code.", gifFile: "alt.gif" },
};