// index.js
require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const messageHandler = require('./messageHandler');

const startBot = async () => {
  console.log('⏳ Inicializando cliente...');

  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log('🔒 Sesión cerrada. Escaneá el QR nuevamente.');
      } else {
        console.log('⚠️ Conexión cerrada. Reconectando...');
      }

      return startBot();
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado correctamente.');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    for (const msg of messages) {
      if (!msg?.message) continue;
      if (msg.key.fromMe) continue;

      const isSystem = msg.message?.protocolMessage || msg.message?.senderKeyDistributionMessage;
      if (isSystem) continue;
      if (type !== 'notify') continue;

      try {
        await messageHandler(sock, msg);
      } catch (err) {
        console.error('❌ Error en messageHandler:', err);
      }
    }
  });
};

startBot();
