def simulate_tab(etat_texte, etat_curseur):
    """
    Retourne l'état obtenu à l'issue de l'exécution de la commande TAB.
    """
    # Position du curseur
    cursor_position = etat_curseur["position"]
