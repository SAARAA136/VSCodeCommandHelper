import json
import sys
from ai_tools.rules import tab_rule, ctrl_a_rule,ctrl_shift_slash_rule,alt_up_down_rule,ctrl_shift_l_rule,ctrl_z_rule,ctrl_y_rule,ctrl_d_rule, ctrl_shift_k_rule

sys.stdout.reconfigure(encoding='utf-8')
etats = json.loads(sys.argv[1])
etats_texte = etats['etats_texte']
etats_curseur = etats['etats_curseur']
lignes = etats_texte[-1].split("\n")

# On regarde si l'utilisateur aurait pu faire une tabulation
if tab_rule(etats_texte):
    print("Tabulation")
    #sys.exit(0)

# Règle de la sélection de tout le document
if len(etats_curseur) > 0 and ctrl_a_rule(lignes, etats_curseur):
    print("CTRL+A")
    #sys.exit(0)

#Règle pour commenter
if ctrl_shift_slash_rule(etats_texte, etats_curseur):
    print("CTRL+Shift+/")
    #sys.exit(0)

#Règle pour déplacer une ligne en haut ou en bas 
if alt_up_down_rule(etats_texte, etats_curseur):
    print("Alt+↑/↓ ")
     #sys.exit(0)

#Règle pour séléctionner toutes les occurrences 
if ctrl_shift_l_rule(etats_texte, etats_curseur):
    print("CTRL+Shift+L ")

#Règle pour annuler la dernière action
if ctrl_z_rule(etats_texte):
    print("CTRL+Z ")

#Règle pour rétablir une action annulée
if ctrl_y_rule(etats_texte):
    print("CTRL+Y ")

#Règle pour sélectionner la prochaine occurrence du mot sélectionné
if ctrl_d_rule(etats_texte, etats_curseur):
    print("CTRL+D")

#Règle pour supprimer la ligne courante
if ctrl_shift_k_rule(etats_texte, etats_curseur):
    print("CTRL+Shift+K ")