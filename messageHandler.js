// messageHandler.js
const recentMessages = new Set();
const { getReply } = require('./replyController');

// 🧹 Limpieza automática cada 5 minutos
setInterval(() => {
  recentMessages.clear();
}, 1000 * 60 * 5);

module.exports = async (sock, msg) => {
  const texto = msg.message?.conversation?.trim();

  // 🛑 Ignorar mensajes vacíos, puntos, emojis sueltos, etc.
  if (!texto || texto.length < 2 || /^[\.\,\!\?\s]+$/.test(texto)) {
    console.log('📭 Mensaje irrelevante ignorado:', texto);
    return;
  }

  // ✅ Procesar solo si el texto coincide con comandos válidos
  const comandosValidos = ['hola', 'pedido', 'info', 'catálogo'];
  const textoNormalizado = texto.toLowerCase();

  if (!comandosValidos.includes(textoNormalizado)) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: '🤖 No entendí tu mensaje. Usá el menú para comenzar.',
    });
    return;
  }

  // 🧭 Flujo guiado
  if (textoNormalizado === 'hola') {
    await sock.sendMessage(msg.key.remoteJid, {
      text: '¡Bienvenido a EsTODOMADERA! 📦 Estanterías de madera a medida — ¡Listas para entrega inmediata! 💫',
    });

    await sock.sendMessage(msg.key.remoteJid, {
      text: '¿Qué deseas saber?',
      buttons: [
        { buttonId: 'pedido', buttonText: { displayText: '🛒 Hacer un pedido' }, type: 1 },
        { buttonId: 'info', buttonText: { displayText: 'ℹ️ Ver información' }, type: 1 },
      ],
    });
  }

  // Podés seguir con lógica para 'pedido', 'info', etc.
};
