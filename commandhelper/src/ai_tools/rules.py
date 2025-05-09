def tab_rule(etats_texte):
    """
    Fonction qui retourne vrai si l'utilisateur aurait pu utiliser la tabulation.
    """
    # On récupère le dernier état
    dernier_etat = etats_texte[-1]
    # On vérifie qu'il possède 4 espaces
    occ = dernier_etat.find('    ')
    if occ != -1:
        return True
    return False

def ctrl_a_rule(lignes, etats_curseur):
    """
    Fonction qui permet de déterminer si l'utilisateur a sélectionné tout le texte.
    """

    # On détermine la position de la fin du document
    end_position = (len(lignes)-1, len(lignes[-1]))

    # Celle du début du document
    start_position = (0, 0)

    # On compare les positions de sélection
    current_start_position = tuple(etats_curseur[-1]["start"])
    current_end_position = tuple(etats_curseur[-1]["end"])

    # print("end_postion", end_position)
    # print("start_position", start_position)
    # print("current_start_position", current_start_position)
    # print("current_end_position", current_end_position)

    return start_position == current_start_position and end_position == current_end_position