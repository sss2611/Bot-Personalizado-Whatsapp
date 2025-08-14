// messageHandler.js
const recentMessages = new Set();

// 🧹 Limpieza automática cada 5 minutos
setInterval(() => {
  recentMessages.clear();
}, 1000 * 60 * 5);

module.exports = async (sock, msg) => {
  if (!msg?.key?.remoteJid) return;

  const jid = msg.key.remoteJid;
  const isGroup = jid.endsWith('@g.us');
  if (isGroup) return;

  if (msg.key.fromMe) return;

  const isSystem = msg.message?.protocolMessage || msg.message?.senderKeyDistributionMessage;
  if (isSystem) return;

  if (msg.message?.stickerMessage) return;

  const messageId = msg.key.id;
  if (recentMessages.has(messageId)) return;
  recentMessages.add(messageId);

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.documentMessage?.caption ||
    null;

  const hasText = !!text;
  const hasMedia = msg.message?.imageMessage || msg.message?.documentMessage;

  if (!hasText && !hasMedia) return;

  await sock.sendMessage(jid, {
    text: '🤖 Hola, gracias por tu mensaje. En breve te responderemos.',
  });
};
