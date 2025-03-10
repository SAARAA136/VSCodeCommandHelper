import json
import sys
from ai_tools.rules import tab_rule, ctrl_a_rule

etats = json.loads(sys.argv[1])
etats_texte = etats['etats_texte']
etats_curseur = etats['etats_curseur']
lignes = etats_texte[-1].split("\n")

# On regarde si l'utilisateur aurait pu faire une tabulation
if tab_rule(etats_texte):
    print("Tabulation")

# Règle de la sélection de tout le document
if len(etats_curseur) > 0 and ctrl_a_rule(lignes, etats_curseur):
    print("CTRL+A")