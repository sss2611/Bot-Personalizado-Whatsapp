// replyController.js
const path = require('path');
const fs = require('fs');
const basePath = path.join(__dirname, './media');
const comprobantesPath = path.join(__dirname, './comprobantes');
const { isOnlyEmoji } = require('./messageHandler');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 📎 Detectar si el mensaje contiene comprobante (PDF o imagen)
function messageHasComprobante(msg) {
    if (!msg || !msg.message) return false;

    const m = msg.message;

    if (m.imageMessage) return true;

    if (m.documentMessage) {
        const mimeType = m.documentMessage.mimetype || '';
        return mimeType.includes('pdf') || mimeType.includes('image');
    }

    return false;
}

// 🧩 Catálogo de productos
const productos = {
    '1': {
        file: '1.jpg',
        nombre: 'Rack para TV (negro)',
        precio: '$44.000',
        descripcion: 'Medidas: 70 centímetros de altura, 120 centímetros de largo, 30 centímetros de profundidad.',
        color: 'Negro',
        stock: '8'
    },
    '2': {
        file: '2.jpg',
        nombre: 'Mesa tipo rack para TV',
        precio: '$34.000',
        descripcion: 'Medidas: 70 centímetros de altura,  90 centímetros de largo, 30 centímetros de profundidad.',
        color: 'Blanco',
        stock: '13'
    },
    '3': {
        file: '3.jpg',
        nombre: 'Estante tipo industrial',
        precio: '$54.000',
        descripcion: 'Medidas: 100 centímetros de altura, 120 centímetros de largo, 30 centímetros de profundidad.',
        color: 'Blanco',
        stock: '5'
    },
    '4': {
        file: '4.jpg',
        nombre: 'Estante tipo industrial ',
        precio: '$54.000',
        descripcion: 'Medidas: 100 centímetros de altura, 120 centímetros de largo, 30 centímetros de profundidad.',
        color: 'Negro',
        stock: '7'
    }
};

// 🧠 Estado conversacional por usuario
const userState = {};

async function getReply(sock, jid, text, msg) {
    const lowerText = text?.toLowerCase?.() || '';
    const hasComprobante = messageHasComprobante(msg);

    // ✅ Si ya pagó, evitar reinicio del flujo
    if (userState[jid]?.pagoConfirmado) {
        await sock.sendMessage(jid, {
            text: 'Ya recibimos tu pago. En breve coordinamos la entrega. 🚚'
        });
        return true;
    }

    // 📥 Procesar comprobante si corresponde
    if (hasComprobante && userState[jid]?.pago === 'transferencia') {
        const m = msg.message;
        const timestamp = Date.now();
        const filenameBase = `${jid.replace(/[@:\s]/g, '_')}_${timestamp}`;

        let stream;
        try {
            stream = await downloadMediaMessage(msg, 'buffer');
        } catch (err) {
            console.error('❌ Error al descargar el comprobante:', err.message);
            await sock.sendMessage(jid, {
                text: 'Hubo un problema al procesar tu comprobante. ¿Podés reenviarlo o enviarlo como documento?'
            });
            return true;
        }

        let ext = 'bin';
        if (m.imageMessage) ext = 'jpg';
        if (m.documentMessage?.mimetype?.includes('pdf')) ext = 'pdf';

        const filePath = path.join(comprobantesPath, `${filenameBase}.${ext}`);
        fs.writeFileSync(filePath, stream);

        await sock.sendMessage(jid, {
            text: `Recibimos tu comprobante (${ext.toUpperCase()}). ¡Gracias por tu pago! 💸`
        });

        userState[jid].pagoConfirmado = true;
        userState[jid].comprobanteGuardado = true;

        // 🧹 Limpieza automática del estado después de 10 minutos
        setTimeout(() => {
            delete userState[jid];
        }, 1000 * 60 * 10);

        return true;
    }

    // 🛒 Flujo conversacional
    if (['hola', 'buenas', 'holaaa', 'ok', '.'].includes(lowerText)) {
        await sock.sendMessage(jid, {
            text: '¡Bienvenido a EsTODOMADERA! Fabricamos estanterías de madera a medida y con stock disponible para entrega inmediata.💫',
        });

        for (const key of Object.keys(productos)) {
            const producto = productos[key];
            const imgPath = path.join(basePath, producto.file);

            if (!fs.existsSync(imgPath)) {
                console.warn(`⚠️ Imagen no encontrada: ${imgPath}`);
                continue;
            }

            const buffer = fs.readFileSync(imgPath);
            await delay(300);
            await sock.sendMessage(jid, {
                image: buffer,
                caption: `🪵 ${producto.nombre}\n🎨 ${producto.color}`
            });
        }

        await delay(300);
        await sock.sendMessage(jid, {
            text: '¿Cuál producto te interesa? Contestame con el número de la imagen.',
        });

        return true;
    }

    if (lowerText === 'info') {
        await sock.sendMessage(jid, {
            text: 'Puedes visitar nuestro Facebook para más información: https://www.facebook.com/groups/507296329349636/user/100026735442194/?locale=es_LA.',
        });
        return true;
    }

    if (lowerText.includes('precio')) {
        await sock.sendMessage(jid, {
            text: 'Nuestros precios varían según el producto. ¿Cuál de los que te pasé te interesa?',
        });
        return true;
    }

    if (productos[lowerText]) {
        const producto = productos[lowerText];
        userState[jid] = { productoSeleccionado: lowerText };

        await sock.sendMessage(jid, {
            text: `🪵 *${producto.nombre}*\n💰 Precio: ${producto.precio}\n📄 ${producto.descripcion}\n🎨 Color: ${producto.color}\n📦 Stock disponible: ${producto.stock}`
        });

        await delay(300);
        await sock.sendMessage(jid, {
            text: '¿Deseás finalizar la compra? Respondé con "si" o "no".'
        });

        return true;
    }

    if (lowerText === 'si' && userState[jid]?.productoSeleccionado) {
        userState[jid].confirmado = true;

        await sock.sendMessage(jid, {
            text: '¿Quisieras que te lo enviemos o lo retirás? Respondé con "envio" o "retiro".'
        });

        return true;
    }

    if (lowerText === 'no' && userState[jid]?.productoSeleccionado) {
        await sock.sendMessage(jid, {
            text: '¿Te interesa algún otro producto? Podés decirme el número de la imagen que viste.'
        });

        delete userState[jid].productoSeleccionado;

        return true;
    }

    if (userState[jid]?.productoSeleccionado && !userState[jid]?.confirmado && lowerText !== 'si' && lowerText !== 'no') {
        await sock.sendMessage(jid, {
            text: 'Gracias, que tengas un buen día 😊'
        });

        delete userState[jid].productoSeleccionado;

        return true;
    }

    if (lowerText === 'envio' && userState[jid]?.confirmado) {
        userState[jid].envio = true;

        await sock.sendMessage(jid, {
            text: 'Por favor, enviame tu ubicación y dirección exacta para coordinar el envío.'
        });

        return true;
    }

    if (userState[jid]?.envio === true && !userState[jid]?.direccionConfirmada) {
        if (text.length >= 10) {
            userState[jid].direccionConfirmada = true;

            await sock.sendMessage(jid, {
                text: 'Gracias por tu dirección. ¿Querés pagar por *transferencia*, *tarjeta de crédito/débito* o *efectivo*?'
            });

            return true;
        }
    }

    if (lowerText === 'retiro' && userState[jid]?.confirmado) {
        userState[jid].envio = false;

        await sock.sendMessage(jid, {
            text: 'Lo puedes retirar en nuestra dirección:\n📍 *Pasaje San Lorenzo 1261 Barrio Ramón Carrillo*. Entre Caseros y Sor Mercedes Guerra.'
        });

        await delay(300);
        await sock.sendMessage(jid, {
            text: '¿Querés pagar por *transferencia*, *tarjeta de crédito/débito* o *efectivo*?'
        });

        return true;
    }

    if (['transferencia', 'tarjeta', 'tarjeta de crédito', 'tarjeta de débito', 'efectivo'].includes(lowerText) && userState[jid]?.confirmado) {
        if (lowerText === 'transferencia') {
            userState[jid].pago = 'transferencia';

            await sock.sendMessage(jid, {
                text: 'Alias: *estodomader*\nTitular: *Taki Taki*\nPor favor, enviá el comprobante cuando lo tengas.'
            });

            return true;
        } else {
            userState[jid].pago = lowerText;
            userState[jid].pagoConfirmado = true;

            await sock.sendMessage(jid, {
                text: 'Gracias, en breve nos contactamos con vos!! 💫'
            });

            // 🧹 Limpieza automática del estado después de 10 minutos
            setTimeout(() => {
                delete userState[jid];
            }, 1000 * 60 * 10);

            return true;
        }
    }

    return false;
}

module.exports = { getReply, userState };
