// src/utils/sendFollowUp.js
const { sendMenu, sendMenuTexto } = require('./buttonManager');
const { getUserState } = require('../core/userStateManager');

const opcionesMap = {
    productos: { id: 'productos', label: '🛍️ Ver productos' },
    direccion: { id: 'direccion', label: '📍 Ver dirección' },
    horarios:  { id: 'horarios',  label: '🕒 Ver horarios' },
    pedido:    { id: 'pedido',    label: '🔄 Hacer un pedido' },
    dueno:     { id: 'dueno',     label: 'Chatear con el dueño' },
    ayuda:     { id: 'ayuda',     label: '❓ Ayuda' },
};

const sendFollowUp = async (sock, jid, isAndroid) => {
    const userState = getUserState(jid);

    await sock.sendMessage(jid, {
        text: '🤖 ¿Necesitás algo más? Te dejo el menú de opciones:',
    });

    const opciones = [];

    if (!userState.pidioProductos) opciones.push(opcionesMap.productos);
    if (!userState.pidioDireccion) opciones.push(opcionesMap.direccion);
    if (!userState.pidioHorarios)  opciones.push(opcionesMap.horarios);

    if (opciones.length === 0) {
        opciones.push(opcionesMap.pedido, opcionesMap.dueno, opcionesMap.ayuda);
    }

    if (isAndroid) {
        await sendMenu(sock, jid, true, opciones);
    } else {
        await sendMenuTexto(sock, jid, opciones);
    }
};

module.exports = { sendFollowUp };