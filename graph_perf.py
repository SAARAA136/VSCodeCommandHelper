import matplotlib.pyplot as plt

with open('./performances2.txt', encoding='utf-8') as fichier:
    temps = fichier.read()

temps = temps.split('\n')
# On retire la dernière ligne
temps.pop()
for i in range(len(temps)):
    temps[i] = float(temps[i])
    
plt.title("Évolution du temps d'exécution d'une simulation en fonction du nombre d'états")
plt.xlabel("Nombre d'états")
plt.ylabel("Temps d'exécution en millisecondes")
plt.plot(temps)
plt.savefig("graph_perf2.png", bbox_inches="tight")
plt.show()