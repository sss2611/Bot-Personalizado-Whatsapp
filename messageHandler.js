// messageHandler.js
const recentMessages = new Set();
const { getReply } = require('./replyController');

// 🧹 Limpieza automática cada 5 minutos
setInterval(() => {
  recentMessages.clear();
}, 1000 * 60 * 5);

module.exports = async (sock, msg) => {
  const jid = msg.key?.remoteJid;
  if (!jid || jid.endsWith('@g.us') || msg.key.fromMe) return;

  const messageId = msg.key.id;
  if (recentMessages.has(messageId)) return;
  recentMessages.add(messageId);

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.documentMessage?.caption ||
    '';

  const lowerText = text.toLowerCase();

  // 🛠️ Lógica directa
  if (['hola', 'buenas', 'holaaa', 'ok', '.', 'info', 'precio', 'de donde sos?'].includes(lowerText)) {
    await sock.sendMessage(jid, {
      text: '¡Bienvenido a EsTODOMADERA! 📦 Estanterías de madera a medida — ¡Listas para entrega inmediata! 💫',
    });

    await sock.sendMessage(jid, {
      text: '¿Qué deseas saber?',
      footer: 'Selecciona una opción tocando el botón 👇',
      templateButtons: [
        { index: 1, quickReplyButton: { displayText: '📍 Dirección', id: 'ubicacion' } },
        { index: 2, quickReplyButton: { displayText: '🕒 Horarios', id: 'horarios' } },
        { index: 3, quickReplyButton: { displayText: '📷 Ver catálogo', id: 'catalogo' } },
      ],
    }, { quoted: msg });

    await sock.sendMessage(jid, {
      text: '¿Querés hacer un pedido?',
      footer: 'Tocá el botón si querés ver modelos disponibles 👇',
      templateButtons: [
        { index: 1, quickReplyButton: { displayText: '🛒 Hacer pedido', id: 'pedido' } },
      ],
    }, { quoted: msg });

    return;
  }

  // 🧠 Lógica delegada al replyController
  const isButtonResponse = !!msg.message?.buttonsResponseMessage;
  if (!isButtonResponse) {
    const replied = await getReply(sock, jid, msg);
    if (replied) return;
  }
};
