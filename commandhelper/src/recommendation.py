import json
import sys
from ai_tools.rules import tab_rule, ctrl_a_rule
from ai_tools.simulation import simulate

etats = json.loads(sys.argv[1])
etats_texte = etats['etats_texte']
etats_curseur = etats['etats_curseur']
lignes = etats_texte[-1].split("\n")

print(f"{etats_curseur = }")
print(f"{etats_texte = }")



##################################
# RECOMMANDATIONS À BASE DE RÈGLES
##################################



# # On regarde si l'utilisateur aurait pu faire une tabulation
# if tab_rule(etats_texte):
#     print("Tabulation")

# # Règle de la sélection de tout le document
# if len(etats_curseur) > 0 and ctrl_a_rule(lignes, etats_curseur):
#     print("CTRL+A")



################################
# RECOMMANDATIONS PAR SIMULATION
################################


# On récupère les commandes recommandées par la simulation
commandes_recommandees = []

if len(etats_curseur) >= 2:
    commandes_recommandees = simulate(etats_texte, etats_curseur)

if commandes_recommandees != []:
    print(commandes_recommandees)