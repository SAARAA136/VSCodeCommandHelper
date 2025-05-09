// Script exécuté dans la Webview (côté client)
(function () {
    const vscode = acquireVsCodeApi();

    // Gestion des messages de mise à jour des commandes
    window.addEventListener('message', event => {
        const message = event.data;

        if (message.type === 'updateCommands') {
            updateCommandList(message.data);
        }
    });

    // Met à jour la liste des commandes dans la Webview
    function updateCommandList(commands) {
        const commandList = document.getElementById('command-list');
        commandList.innerHTML = '';

        if (commands.length === 0) {
            commandList.innerHTML = '<div class="empty-list">Aucune commande recommandée pour le moment.</div>';
            return;
        }

        commands.forEach(command => {
            const commandItem = document.createElement('div');
            commandItem.className = 'command-item';

            // Checkbox pour activer/désactiver la commande
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = command.enabled;
            checkbox.addEventListener('change', () => {
                vscode.postMessage({
                    type: 'toggleCommand',
                    commandName: command.name,
                    enabled: checkbox.checked
                });
            });

            // Conteneur pour le nom de la commande et son raccourci
            const commandInfo = document.createElement('div');
            commandInfo.className = 'command-info';

            // Nom de la commande
            const commandName = document.createElement('div');
            commandName.className = 'command-name';
            commandName.textContent = command.name;
            commandInfo.appendChild(commandName);

            // Raccourci clavier (si disponible)
            if (command.keybinding) {
                const keybinding = document.createElement('div');
                keybinding.className = 'command-keybinding';
                keybinding.textContent = command.keybinding;
                commandInfo.appendChild(keybinding);
            }

            // Assemblage
            commandItem.appendChild(checkbox);
            commandItem.appendChild(commandInfo);
            commandList.appendChild(commandItem);
        });
    }
})();