// menuController.js
async function mostrarMenuPrincipal(sock, msg) {
    const jid = msg.key.remoteJid;

    await sock.sendMessage(jid, {
        text: '¡Bienvenido a EsTODOMADERA! 📦 Estanterías de madera a medida — ¡Listas para entrega inmediata! 💫\n\n¿Qué deseas saber?',
        footer: 'Seleccioná una opción tocando el botón 👇',
        buttons: [
            { buttonId: 'ubicacion', buttonText: { displayText: '📍 Dirección' }, type: 1 },
            { buttonId: 'horarios', buttonText: { displayText: '🕒 Horarios' }, type: 1 },
            { buttonId: 'catalogo', buttonText: { displayText: '📷 Ver catálogo' }, type: 1 },
            { buttonId: 'pedido', buttonText: { displayText: '🛒 Hacer pedido' }, type: 1 },
        ],
    }, { quoted: msg });
}

module.exports = { mostrarMenuPrincipal };
