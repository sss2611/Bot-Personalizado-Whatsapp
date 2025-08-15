// replyontroller.js
const path = require('path');
const fs = require('fs');
const basePath = path.join(__dirname, './media');

async function getReply(sock, jid, msg) {
    const selected = msg.message?.buttonsResponseMessage?.selectedButtonId;
    if (!selected) return false;

    console.log('🔘 Botón seleccionado:', selected);

    try {
        switch (selected) {
            case 'ubicacion':
                await sock.sendMessage(jid, {
                    text: '📍 Estamos en Pje San Lorenzo 1261, Santiago del Estero.\n🗺️ https://maps.app.goo.gl/XYZ123',
                });
                break;

            case 'horarios':
                await sock.sendMessage(jid, {
                    text: '🕒 Lunes a viernes de 9 a 18 hs. Sábados de 9 a 13 hs.',
                });
                break;

            case 'catalogo':
                await sock.sendMessage(jid, {
                    text: '📷 Aquí tenés nuestro catálogo actualizado:',
                });

                const catalogPath = path.join(basePath, 'catalogo.jpg');
                if (fs.existsSync(catalogPath)) {
                    const imageBuffer = fs.readFileSync(catalogPath);
                    await sock.sendMessage(jid, {
                        image: imageBuffer,
                        caption: '🪵 Estanterías disponibles — precios y modelos actualizados.',
                    });
                } else {
                    await sock.sendMessage(jid, {
                        text: '⚠️ No se encontró el catálogo. Contactá con soporte.',
                    });
                }
                break;

            case 'pedido':
                await sock.sendMessage(jid, {
                    text: '🛒 Para hacer tu pedido, respondé con el modelo que te interesa.\nEjemplo: "Quiero el modelo A de 3 estantes".',
                });
                break;

            default:
                return false;
        }

        return true;
    } catch (err) {
        console.error('❌ Error en getReply:', err.message);
        await sock.sendMessage(jid, {
            text: '⚠️ Ocurrió un error al procesar tu solicitud. Intentá nuevamente.',
        });
        return true;
    }
}

module.exports = { getReply };
