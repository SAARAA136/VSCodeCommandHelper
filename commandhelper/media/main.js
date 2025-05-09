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
    const vscode = acquireVsCodeApi();

    // Keep track of the current checkboxes
    const checkboxes = Array.from(commandListContainer.getElementsByClassName('command-item'));

    commands.forEach((command, index) => {
        // If the checkbox already exists, update its state
        const existingElement = checkboxes[index];

        if (existingElement) {
            const checkbox = existingElement.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = command.enabled;
            }
        } else {
            // Otherwise, create a new checkbox if it doesn't exist
            const commandElement = document.createElement('div');
            commandElement.classList.add('command-item');

            // Create the checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = command.enabled;

            checkbox.addEventListener('change', (event) => {
                const enabled = event.target.checked;
                vscode.postMessage({
                    type: 'toggleCommand',
                    commandName: command.name,
                    enabled: enabled
                });
            });

            // Create the command name text
            const commandText = document.createElement('span');
            commandText.textContent = command.name || 'Unnamed Command';

            // Append checkbox and text to the commandElement
            commandElement.appendChild(checkbox);
            commandElement.appendChild(commandText);

            // Append the new command to the container
            commandListContainer.appendChild(commandElement);
        }
    });

    // Remove any extra elements that no longer exist in the updated list
    if (checkboxes.length > commands.length) {
        for (let i = commands.length; i < checkboxes.length; i++) {
            commandListContainer.removeChild(checkboxes[i]);
        }
    }
}