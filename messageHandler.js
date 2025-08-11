// messageHandler.js
require('dotenv').config();
const { getReply } = require('./replyController');

// 🧠 Cache en memoria para evitar respuestas duplicadas
const recentMessages = new Set();

// 🧹 Limpieza automática cada 5 minutos
setInterval(() => {
  recentMessages.clear();
}, 1000 * 60 * 5);

// ✅ Función para detectar si el texto es solo emojis
function isOnlyEmoji(text) {
  const emojiRegex = /[\p{Emoji_Presentation}\uFE0F]/gu;
  const stripped = text.replace(emojiRegex, '').trim();
  return stripped.length === 0;
}

module.exports.isOnlyEmoji = isOnlyEmoji;

// 🧠 Handler principal
module.exports = async (sock, msg) => {
  if (!msg?.key?.remoteJid) return;

  const jid = msg.key.remoteJid;
  const isGroup = jid.endsWith('@g.us');
  if (isGroup) {
    console.log('👥 Mensaje de grupo ignorado.');
    return;
  }

  const remitente = jid.replace('@s.whatsapp.net', '');
  console.log(`📨 Remitente: ${remitente}`);

  // 🧩 Extraer texto del mensaje
  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.documentMessage?.caption ||
    null;

  const hasText = !!text;
  const hasMedia = msg.message?.imageMessage || msg.message?.documentMessage;

  if (!hasText && !hasMedia) {
    console.log('📭 Mensaje sin texto ni comprobante. Ignorado.');
    return;
  }

  const lowerText = typeof text === 'string' ? text.toLowerCase() : '';
  console.log(`📩 Mensaje recibido de ${remitente}: ${lowerText}`);

  // 🚫 Ignorar respuestas automáticas del bot
  if (/no entendí.*mensaje/i.test(lowerText)) {
    console.log('🔁 Mensaje automático del bot. Ignorado.');
    return;
  }

  // 🚫 Ignorar stickers
  if (msg.message?.stickerMessage) {
    console.log('🧃 Sticker recibido. Ignorado.');
    return;
  }

  // 🚫 Ignorar mensajes ya procesados
  const messageId = msg.key.id;
  if (recentMessages.has(messageId)) {
    console.log('🕳️ Mensaje ya procesado. Ignorado.');
    return;
  }
  recentMessages.add(messageId);

  // 🔍 Ejecutar lógica de respuesta
  console.log('🔍 Ejecutando getReply...');
  const replied = await getReply(sock, jid, lowerText, msg);
  console.log(`📤 ¿Respondió?: ${replied}`);

  if (replied) return;

  // 🚫 Evitar respuesta genérica si ya pagó
  const userState = require('./replyController').userState;
  if (userState[jid]?.pagoConfirmado) {
    console.log('💸 Usuario ya pagó. No se envía respuesta genérica.');
    return;
  }

  // 🟦 Si no hay coincidencia, se envía respuesta por defecto
  console.log('🤖 Sin coincidencia, enviando respuesta por defecto.');
  await sock.sendMessage(jid, {
    text: '🤖 No entendí tu mensaje. ¿Puedes repetirlo?'
  });
};
