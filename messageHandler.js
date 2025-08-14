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

    await delay(500); // ⏳ Espera breve para evitar saturación

    await sock.sendMessage(jid, {
      buttons: [
        { buttonId: 'ubicacion', buttonText: { displayText: '📍 Dirección' }, type: 1 },
        { buttonId: 'horarios', buttonText: { displayText: '🕒 Horarios' }, type: 1 },
        { buttonId: 'catalogo', buttonText: { displayText: '📷 Ver catálogo' }, type: 1 },
      ],
      contentText: '¿Qué deseas saber?',
      footerText: 'Selecciona una opción tocando el botón 👇',
      headerType: 1,
    }, { quoted: msg });

    await delay(500); // ⏳ Otro delay para el segundo bloque

    await sock.sendMessage(jid, {
      buttons: [
        { buttonId: 'pedido', buttonText: { displayText: '🛒 Hacer pedido' }, type: 1 },
      ],
      contentText: '¿Querés hacer un pedido?',
      footerText: 'Tocá el botón si querés ver modelos disponibles 👇',
      headerType: 1,
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
