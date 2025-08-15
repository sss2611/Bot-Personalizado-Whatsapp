// messageHandler.js
const recentMessages = new Set();
const { getReply } = require('./replyController');
const { mostrarMenuPrincipal } = require('./menuController'); // si lo tenés separado

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
  if (lowerText === 'hola') {
    console.log('Enviando menú principal...');
    await mostrarMenuPrincipal(sock, msg);
    return;
  }

  // 🧠 Lógica delegada al replyController
  const isButtonResponse = !!msg.message?.buttonsResponseMessage;
  if (!isButtonResponse) {
    const replied = await getReply(sock, jid, msg);
    if (replied) return;
  }

  return;
};
