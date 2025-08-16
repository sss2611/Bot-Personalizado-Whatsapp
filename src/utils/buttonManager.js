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

const generarTextoOpciones = (opciones = [], encabezado = '📋 Respondeme:') => {
    const texto = opciones.length
        ? opciones.map(({ label }, i) => `${i + 1}️⃣ ${label.toUpperCase()}`).join('\n')
        : '1️⃣ 🛍️ VER PRODUCTOS\n2️⃣ 📍 VER DIRECCIÓN\n3️⃣ 🕒 VER HORARIOS\n4️⃣ 🔄 HACER UN PEDIDO\n5️⃣ 💬 CHATEAR CON EL DUEÑO\n6️⃣ ❓ AYUDA';

    return `${encabezado}\n\n${texto}\n\nEscribí solo el número o lo que está resaltado.`;
};

const sendMenuTexto = async (sock, jid, opciones = []) => {
    const texto = generarTextoOpciones(opciones);
    await sock.sendMessage(jid, { text: texto });
};

module.exports = {
    sendMenu,
    sendMenuTexto,
    generarTextoOpciones
};
