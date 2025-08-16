// src/utils/sendFollowUp.js
const { sendMenu, sendMenuTexto } = require('./buttonManager');
const { getUserState } = require('../core/userStateManager');

const opcionesMap = {
    productos: { id: 'productos', label: '🛍️ Ver productos' },
    direccion: { id: 'direccion', label: '📍 Ver dirección' },
    horarios: { id: 'horarios', label: '🕒 Ver horarios' },
    pedido:   { id: 'pedido', label: '🔄 Hacer un pedido' },
    dueno:    { id: 'dueno', label: '💬 Chatear con el dueño' },
    ayuda:    { id: 'ayuda', label: '❓ Ayuda' },
};

const sendFollowUp = async (sock, jid, isAndroid) => {
    const opciones = [
        opcionesMap.productos,
        opcionesMap.direccion,
        opcionesMap.horarios,
        opcionesMap.pedido,
        opcionesMap.dueno,
        opcionesMap.ayuda,
    ];

    await sock.sendMessage(jid, {
        text: '❓ No entendí tu mensaje. Estas son las opciones disponibles:',
    });

    if (isAndroid) {
        await sendMenu(sock, jid, true, opciones);
    } else {
        await sendMenuTexto(sock, jid, opciones);
    }
};

module.exports = { sendFollowUp };
