// src/handlers/messageHandler.js
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const IMAGE_PATH = path.resolve(__dirname, '../../media/respuesta.jpg');

const messageHandler = async (sock, msg) => {
    const sender = msg.key.remoteJid;
    const message = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

    if (!message) return;

    const lowerMsg = message.toLowerCase().trim();

    // 📌 Respuesta automática por palabra clave
    if (lowerMsg.includes('hola')) {
        await sock.sendMessage(sender, { text: '👋 ¡Hola! Soy tu bot personalizado. ¿En qué puedo ayudarte?' });
        return;
    }

    if (lowerMsg.includes('imagen')) {
        // 📎 Envío de imagen local
        if (!fs.existsSync(IMAGE_PATH)) {
            await sock.sendMessage(sender, { text: '⚠️ Imagen no disponible en el servidor.' });
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

    // 🧪 Comando no reconocido
    await sock.sendMessage(sender, { text: '🤖 Comando no reconocido. Escribí "hola" o "imagen".' });
};

module.exports = messageHandler;
