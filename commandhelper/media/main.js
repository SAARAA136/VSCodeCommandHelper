// Attente d'un message de l'extension
window.addEventListener('message', event => {
    const message = event.data;

    switch (message.type) {
        case 'updateCommands':
            // Mise à jour des commandes reçues
            console.log(message.data);
            updateCommandList(message.data);
            break;
        default:
            break;
    }
});

// Fonction de mise à jour de la liste des commandes
function updateCommandList(commands) {
    const commandListContainer = document.getElementById('command-list');
    commandListContainer.innerHTML = ''; // Vider le contenu existant

    // Ajouter chaque commande à la liste
    commands.forEach(command => {
        // Créé un nouveau div qui contient une checkbox et son label
        const commandElement = document.createElement('div');
        commandElement.classList.add('command-item');

        // Créé la checkbox pour chaque commande
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = command.enabled;

        // Ensure the checkbox reflects the change
        checkbox.addEventListener('change', () => {
            const enabled = checkbox.checked;
            vscode.postMessage({
                type: 'toggleCommand',
                command: command,
                enabled: enabled
            });
        });

        // Créé l'élément span qui contient le nom de la commande
        const commandText = document.createElement('span');
        commandText.textContent = command.name || 'Unnamed Command';

        // Ajoute une checkbox et du texte à commandElement div
        commandElement.appendChild(checkbox);
        commandElement.appendChild(commandText);

        // Ajoute le commandElement au container
        commandListContainer.appendChild(commandElement);
    });
}
