// replyController.js
const path = require('path');
const fs = require('fs');
const basePath = path.join(__dirname, './media');

const userState = {};

async function getReply(sock, jid, msg) {
    const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.documentMessage?.caption ||
        '';

    const lowerText = text.toLowerCase();

    // 🧠 Mostrar menú si el usuario pide información
    if (['info', 'quiero saber', 'información'].includes(lowerText)) {
        userState[jid] = { esperandoOpcion: true };

        await sock.sendMessage(jid, {
            text: `¿Qué deseas saber?\n🔽 Elige una opción:\n1️⃣ 📍 Dirección y ubicación\n2️⃣ 🕒 Horarios de atención\n3️⃣ 📷 Ver catálogo (fotos y precios)\n4️⃣ 🛒 Hacer pedido (te envío modelos con foto y precio)`
        });

        return true;
    }

    // 🧠 Procesar respuesta del menú
    if (userState[jid]?.esperandoOpcion) {
        switch (lowerText) {
            case '1':
                await sock.sendMessage(jid, {
                    text: '📍 Nuestra dirección es: *Pasaje San Lorenzo 1261, Barrio Ramón Carrillo*. Entre Caseros y Sor Mercedes Guerra.'
                });
                break;

            case '2':
                await sock.sendMessage(jid, {
                    text: '🕒 Horarios de atención:\nLunes a viernes de 9:00 a 18:00\nSábados de 9:00 a 13:00'
                });
                break;

            case '3':
                await sock.sendMessage(jid, {
                    text: '📷 Podés ver nuestro catálogo en Facebook:\nhttps://www.facebook.com/groups/507296329349636/user/100026735442194/?locale=es_LA'
                });
                break;

            case '4':
                await sock.sendMessage(jid, {
                    text: '🛒 Perfecto, te envío los modelos disponibles con foto y precio.'
                });
                // Podés agregar aquí lógica para enviar imágenes si querés
                break;

            default:
                await sock.sendMessage(jid, {
                    text: '❌ Opción no válida. Por favor, respondé con un número del 1 al 4.'
                });
                return true;
        }

        delete userState[jid]; // Limpieza del estado
        return true;
    }

    return false;
}

module.exports = { getReply };

