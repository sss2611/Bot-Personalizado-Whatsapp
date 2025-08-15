// src/handlers/messageHandler.js
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const IMAGE_PATH = path.resolve(__dirname, '../../media/respuesta.jpg');

const messageHandler = async (sock, msg) => {
    const sender = msg.key.remoteJid;
    const message = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const buttonId = msg.message?.buttonsResponseMessage?.selectedButtonId || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;

    if (!message && !buttonId) return;

    const lowerMsg = message?.toLowerCase().trim();

    // ✅ Detección real del cliente Android
    const isAndroid = msg.key.id?.includes(':');
    console.log(`🧪 ID del mensaje: ${msg.key.id}`);
    console.log(`✅ ¿Cliente Android?: ${isAndroid}`);

    const { sendMenu } = require('../utils/buttonManager');

    // 📌 Activador inicial
    if (lowerMsg?.includes('hola') || lowerMsg?.includes('menu')) {
        await sendMenu(sock, sender, isAndroid);
        return;
    }

    // 📎 Botón: Ver imagen
    if (lowerMsg === 'productos' || buttonId === 'productos') {
        if (!fs.existsSync(IMAGE_PATH)) {
            await sock.sendMessage(sender, { text: '⚠️ Por ahora no tengo imágenes de los productos, ¿algo más que necesites?' });
            return;
        }

        const buffer = fs.readFileSync(IMAGE_PATH);
        const mimeType = mime.lookup(IMAGE_PATH) || 'image/jpeg';

        await sock.sendMessage(sender, {
            image: { mimetype: mimeType, buffer },
            caption: '🖼️ Esta es la imagen solicitada.',
        });
        return;
    }

    // 📎 Botón: Ayuda
    if (lowerMsg === 'ayuda' || buttonId === 'ayuda') {
        await sock.sendMessage(sender, {
            text: '📖 Escribime:\n- *PRODUCTOS*\n- *AYUDA*\n- *MENU*',
        });
        return;
    }

    // 👋 Despedida si responde "no"
    if (lowerMsg === 'no') {
        await sock.sendMessage(sender, {
            text: '👋 Hasta luego, que tengas buen día!',
        });
        return;
    }

    // 🧪 Comando no reconocido
    await sock.sendMessage(sender, {
        text: '🤖 No entendí tu mensaje. Por favor, escribime *Hola* o *Menú*',
    });
};

module.exports = messageHandler;
