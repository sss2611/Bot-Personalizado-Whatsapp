// src/utils/buttonManager.js
const sendMenu = async (sock, jid, isAndroid, opciones = []) => {
    if (isAndroid) {
        const buttons = opciones.map(({ id, label }) => ({
            buttonId: id,
            buttonText: { displayText: label },
            type: 1,
        }));

        await sock.sendMessage(jid, {
            text: '📋 Seleccioná una opción:',
            buttons,
        });
    } else {
        await sendMenuTexto(sock, jid, opciones);
    }
};

const sendMenuTexto = async (sock, jid, opciones = []) => {
    const texto = opciones.length
        ? opciones.map(({ label }, i) => `${i + 1}️⃣ *${label.toUpperCase()}*`).join('\n')
        : '1️⃣ *CATÁLOGO* \n2️⃣ *DIRECCIÓN* \n3️⃣ *HORARIOS* \n4️⃣ *COMPRAR* \n5️⃣ *CONTACTO* \n6️⃣ *AYUDA*';

    await sock.sendMessage(jid, {
        text: `📋 Respondeme:\n\n${texto}\n\nEscribí solo lo que está resaltado.`,
    });
};

module.exports = { sendMenu, sendMenuTexto };
