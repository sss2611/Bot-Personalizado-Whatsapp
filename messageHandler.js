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
  if (['hola', 'buenas', 'holaaa', 'ok', ''].includes(lowerText)) {
    await sock.sendMessage(jid, {
      text: 'Somos EsTODOMADERA, madera que dura, confianza que crece 💫',
    });
    return;
  }

  // 🧠 Lógica delegada al replyController
  const replied = await getReply(sock, jid, msg);
  if (replied) return;
};
