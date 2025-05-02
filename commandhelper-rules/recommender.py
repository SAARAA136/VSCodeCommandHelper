import time
from collections import Counter

class CommandRecommender:
    def __init__(self):
        self.actions = []  # Stocke les actions de l'utilisateur
        self.recommendations = {
            "3_spaces": "Utiliser une tabulation (TAB)",
            "ctrl_c_ctrl_v": "Utiliser 'Dupliquer la ligne' (Shift+Alt+↓)"
        }
        self.rejected_recommendations = {}  # Stocke les refus des recommandations

    def log_action(self, action):
        """Ajoute une action à la liste des logs"""
        self.actions.append(action)
        print(f"Action enregistrée: {action}")
        
    def analyze_patterns(self):
        """Analyse les actions et propose une commande si un pattern est détecté"""
        counts = Counter(self.actions)  # Compte les occurrences des actions
        
        for action, recommendation in self.recommendations.items():
            # Vérifier si l'action est répétée au moins 3 fois
            if counts[action] >= 3:
                # Vérifier si l'utilisateur a refusé cette suggestion trop souvent
                if self.rejected_recommendations.get(recommendation, 0) < 2:
                    print(f"\n Recommandation : {recommendation}")
                    user_response = input(" Accepter cette recommandation ? (oui/non) : ").strip().lower()
                    
                    # Vérifier si la réponse est bien "oui" ou "non"
                    while user_response not in ["oui", "non"]:
                        print(" Réponse invalide ! Tape 'oui' ou 'non'.")
                        user_response = input(" Accepter cette recommandation ? (oui/non) : ").strip().lower()
                    
                    if user_response == "non":
                        self.rejected_recommendations[recommendation] = self.rejected_recommendations.get(recommendation, 0) + 1
                        print(" Suggestion ignorée. On s'adapte !")
                    else:
                        print(" Suggestion acceptée !")

# ====================== TEST ======================

recommender = CommandRecommender()

# Simulons l'utilisateur qui tape plusieurs fois "3 espaces"
for _ in range(4):  # Tape "3 espaces" 4 fois
    recommender.log_action("3_spaces")
    time.sleep(0.5)

# Simulons un copier-coller fréquent
for _ in range(3):  # Ctrl+C puis Ctrl+V
    recommender.log_action("ctrl_c_ctrl_v")
    time.sleep(0.5)

# Analyse des patterns et suggestion des commandes
recommender.analyze_patterns()
