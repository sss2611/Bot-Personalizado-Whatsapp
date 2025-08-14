// replyController.js
const path = require('path');
const fs = require('fs');
const basePath = path.join(__dirname, './media');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 🛒 Flujo conversacional
async function getReply(sock, jid, message) {
    const lowerText = message.text?.toLowerCase() || '';

    if (['hola', 'buenas', 'holaaa', 'ok', '.'].includes(lowerText)) {
        await sock.sendMessage(jid, {
            text: '¡Bienvenido a EsTODOMADERA! Fabricamos estanterías de madera a medida y con stock disponible para entrega inmediata.💫',
        });
        return;
    }

    if (lowerText === 'info') {
        await sock.sendMessage(jid, {
            text: 'Puedes visitar nuestro Facebook para más información: https://www.facebook.com/groups/507296329349636/user/100026735442194/?locale=es_LA.',
        });
        return;
    }

    if (lowerText.includes('precio')) {
        await sock.sendMessage(jid, {
            text: 'Nuestros precios varían según el producto. ¿Cuál de los que te pasé te interesa?',
        });
        return;
    }
}

module.exports = { getReply };
