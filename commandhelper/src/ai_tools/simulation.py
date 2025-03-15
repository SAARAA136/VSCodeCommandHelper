def simulate_tab(etat_texte, etat_curseur):
    """
    Retourne l'état (paire d'états <texte, curseur>) obtenu à l'issue de
    l'exécution de la commande TAB, cad ajoute 4 espaces à l'emplacement
    du curseur.
    """

    # Position du curseur
    pos_line, pos_col = etat_curseur['position']

    # Lignes du texte
    lines = etat_texte.split('\n')

    # Ajout de 4 espaces à la position courante du curseur
    line = lines[pos_line]
    new_line = line[:pos_col] + '    ' + line[pos_col:]
    lines[pos_line] = new_line

    # On retourne le nouvel état simulé
    new_etat_texte = '\n'.join(lines)
    new_etat_curseur = {
        'position': [pos_line, pos_col+4],
        'start': [pos_line, pos_col+4],
        'end': [pos_line, pos_col+4]
    }

    return new_etat_texte, new_etat_curseur

def simulate_ctrl_a(etat_texte, etat_curseur):
    """
    Retourne l'état (paire d'états <texte, curseur>) obtenu à l'issue de
    l'exécution de la commande CTRL+A, qui déplace le curseur de la fin
    du document vers le début.
    """

    # Lignes du texte
    lines = etat_texte.split('\n')

    # Position de la fin du document
    pos_line = len(lines)-1
    pos_col = len(lines[-1])

    # Sélection de tout le document
    new_etat_curseur = {
        'position': [pos_line, pos_col],
        'start': [0, 0],
        'end': [pos_line, pos_col]
    }

    # L'état du texte reste inchangé
    return etat_texte, new_etat_curseur

def simulate_comment(etat_texte, etat_curseur):
    """
    Retourne l'état (paire d'états <texte, curseur>) obtenu à l'issue de
    l'exécution de la commande CTRL+SHIFT+/, qui permet de commenter une
    ligne (en Python).

    À améliorer pour éventuellement prendre en compte l'espace qui sépare le
    caractère de commentaire ('#' en Python) du reste de la ligne.
    """

    # Position du curseur
    pos_line, _ = etat_curseur['position']

    # Lignes du texte
    lines = etat_texte.split('\n')

    # Ajout d'un '#' au début de la ligne dans laquelle se trouve le curseur
    lines[pos_line] = '# ' + lines[pos_line]

    return '\n'.join(lines), etat_curseur

def simulate_move_line_up(etat_texte, etat_curseur):
    """
    Retourne l'état (paire d'états <texte, curseur>) obtenu à l'issue de
    l'exécution de la commande ALT+↑ qui déplace la ligne (ou le bloc
    de texte : TODO) vers le haut.
    """

     # Position du curseur
    pos_line, _ = etat_curseur['position']

    # Lignes du texte
    lines = etat_texte.split('\n')

    # La ligne courante est la première ligne, rien ne se passe
    if pos_line == 0:
        return etat_texte, etat_curseur
    
    # On inverse la ligne du curseur avec la ligne du dessus
    assert pos_line >= 1

    temp = lines[pos_line]
    lines[pos_line] = lines[pos_line-1]
    lines[pos_line-1] = temp

    return '\n'.join(lines), etat_curseur

def simulate_move_line_down(etat_texte, etat_curseur):
    """
    Retourne l'état (paire d'états <texte, curseur>) obtenu à l'issue de
    l'exécution de la commande ALT+↓ qui déplace la ligne (ou le bloc
    de texte : TODO) vers le bas.
    """

     # Position du curseur
    pos_line, _ = etat_curseur['position']

    # Lignes du texte
    lines = etat_texte.split('\n')

    # La ligne courante est la dernière ligne, rien ne se passe
    if pos_line == len(lines)-1:
        return etat_texte, etat_curseur
    
    # On inverse la ligne du curseur avec la ligne du dessous
    assert pos_line < len(lines)-1

    temp = lines[pos_line]
    lines[pos_line] = lines[pos_line+1]
    lines[pos_line+1] = temp

    return '\n'.join(lines), etat_curseur




def simulate(etats_texte, etats_curseur, liste_commandes=[simulate_tab,
                                                          simulate_ctrl_a,
                                                          simulate_comment,
                                                          simulate_move_line_up,
                                                          simulate_move_line_down]):
    """
    Fonction qui simule toutes les commandes avancées (implémentées) de
    'liste_commandes' et retourne une liste de paires correspondant à la
    commande à appliquer et l'indice de l'état dans lequel l'appliquer
    pour obtenir l'état courant.

    ATTENTION: Il faut qu'il y ait au moins deux états pour que la
    simulation puisse s'appliquer.
    """

    assert len(etats_curseur) >= 2

    dernier_etat_texte = etats_texte[len(etats_texte)-1]
    dernier_etat_curseur = etats_curseur[len(etats_curseur)-1]

    commandes_recommandees = []

    # On parcourt tous les états qui précède le dernier état
    for i in range(len(etats_curseur)-2):

        # On simule toutes les commandes
        for commande in liste_commandes:

            # Application de la commande courante
            new_etat_texte, new_etat_curseur = commande(etats_texte[i], etats_curseur[i])

            # Cas où la commande correspond bien à l'état final, on la recommande
            if new_etat_texte == dernier_etat_texte and new_etat_curseur == dernier_etat_curseur:
                commandes_recommandees.append((i, commande.__name__))

    return commandes_recommandees