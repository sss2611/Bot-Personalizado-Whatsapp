// src/utils/buttonManager.js
const sendMenu = async (sock, jid, isAndroid) => {
    if (isAndroid) {
        await sock.sendMessage(jid, {
            text: '📋 Seleccioná una opción:',
            buttons: [
                { buttonId: 'productos', buttonText: { displayText: '🖼️ Ver imagen' }, type: 1 },
                { buttonId: 'ayuda', buttonText: { displayText: '📖 Ayuda' }, type: 1 },
            ],
        });
    } else {
        await sock.sendMessage(jid, {
            text: '📋 Respondeme:\n\n👉 *PRODUCTOS*_ Para las imagenes de los productos \n \n 👉 *AYUDA*_ Así te guío \n\nEscribí solo lo que esta resaltado.',
        });
    }
};

module.exports = { sendMenu };