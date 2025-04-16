// Attente d'un message de l'extension
window.addEventListener('message', event => {
    const message = event.data;

    switch (message.type) {
        case 'updateCommands':
            // Mise à jour des commandes reçues
            console.log(message.data);  // Log the data to check if it's correct
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
        // Create a new div to hold each checkbox and its label (text)
        const commandElement = document.createElement('div');
        commandElement.classList.add('command-item');

        // Create the checkbox for each command
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

        // Create the span element to hold the command's name
        const commandText = document.createElement('span');
        commandText.textContent = command || 'Unnamed Command';  // Ensure there's text here

        // Append the checkbox and text to the commandElement div
        commandElement.appendChild(checkbox);
        commandElement.appendChild(commandText);

        // Append the commandElement to the container
        commandListContainer.appendChild(commandElement);
    });
}
