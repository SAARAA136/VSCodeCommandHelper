def tab_rule(etats_texte):
    """Détecte si l'utilisateur aurait pu utiliser Tab (4 espaces au début d'une ligne)"""
    if not etats_texte:
        return False
    lignes = etats_texte[-1].split("\n")
    for ligne in lignes:
        if ligne.startswith("    "):
            return True
    return False


def ctrl_a_rule(lignes, etats_curseur):
    """Détecte si l'utilisateur sélectionne tout le texte"""
    if not lignes or not etats_curseur:
        return False
    end_position = (len(lignes)-1, len(lignes[-1]))
    start_position = (0, 0)
    current_start = tuple(etats_curseur[-1]["start"])
    current_end = tuple(etats_curseur[-1]["end"])
    return current_start == start_position and current_end == end_position


def ctrl_shift_slash_rule(etats_texte, etats_curseur):
    """Détecte si l'utilisateur aurait pu commenter/décommenter"""
    if not etats_texte or not etats_curseur:
        return False
    lignes = etats_texte[-1].split("\n")
    start_line = etats_curseur[-1]["start"][0]
    end_line = etats_curseur[-1]["end"][0]
    for i in range(start_line, end_line + 1):
        ligne = lignes[i].strip()
        if ligne and not ligne.startswith("//"):
            return True
    return False


def alt_up_down_rule(etats_texte, etats_curseur):
    """Détecte si l'utilisateur aurait pu déplacer une ligne (Alt+↑/↓)"""
    if not etats_texte or not etats_curseur:
        return False
    curseur = etats_curseur[-1]
    start_line = curseur["start"][0]
    end_line = curseur["end"][0]
    return start_line == end_line


def ctrl_shift_l_rule(etats_texte, etats_curseur):
    """Détecte si plusieurs occurrences d’un mot sont présentes pour CTRL+Shift+L"""
    if not etats_texte or not etats_curseur:
        return False
    curseur = etats_curseur[-1]
    lignes = etats_texte[-1].split("\n")
    ligne = lignes[curseur["start"][0]]
    if curseur["start"][1] != curseur["end"][1]:
        mot = ligne[curseur["start"][1]:curseur["end"][1]]
        if lignes[-1].count(mot) > 1:
            return True
    return False


def ctrl_z_rule(etats_texte):
    """Détecte un changement annulable dans l’état du texte"""
    if len(etats_texte) < 2:
        return False
    dernier = etats_texte[-1].strip()
    avant = etats_texte[-2].strip()
    if avant and dernier and len(dernier) < len(avant):
        return True
    return False


def ctrl_y_rule(etats_texte):
    """Détecte un rétablissement après annulation"""
    if len(etats_texte) < 3:
        return False
    avant_annulation = etats_texte[-3].strip()
    apres_annulation = etats_texte[-2].strip()
    retabli = etats_texte[-1].strip()
    return avant_annulation == retabli and retabli != apres_annulation


def ctrl_d_rule(etats_texte, etats_curseur):
    """Détecte une duplication de ligne ou sélection"""
    if len(etats_texte) < 2 or not etats_curseur:
        return False
    selection = etats_texte[-1].strip()
    return etats_texte[-2].strip().count(selection) > 1


def ctrl_shift_k_rule(etats_texte, etats_curseur):
    """Détecte une suppression de ligne"""
    if len(etats_texte) < 2 or not etats_curseur:
        return False
    lignes_avant = etats_texte[-2].split("\n")
    lignes_apres = etats_texte[-1].split("\n")
    return len(lignes_apres) < len(lignes_avant)
