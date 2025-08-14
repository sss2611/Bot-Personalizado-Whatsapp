// index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const messageHandler = require('./messageHandler');

const delay = ms => new Promise(res => setTimeout(res, ms));

const startBot = async () => {
  console.log('⏳ Inicializando cliente...');

  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error || {}).output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log('🔒 Sesión cerrada. Escaneá el QR nuevamente.');
      } else {
        console.log('⚠️ Conexión cerrada. Reconectando...');
      }

      await delay(3000);
      return startBot();
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado correctamente.');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    for (const msg of messages) {
      if (!msg?.message || msg.key.fromMe || type !== 'notify') continue;
      try {
        await messageHandler(sock, msg);
      } catch (err) {
        if (err.message?.includes('No matching sessions')) {
          console.log('⚠️ Mensaje no descifrado. Ignorado.');
        } else {
          console.error('❌ Error en messageHandler:', err);
        }
      }

    }
  });
};

startBot();

// 🌐 Express para mantener activo en Render
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('🤖 Bot de WhatsApp activo'));
app.get('/ping', (req, res) => res.json({ message: 'pong' }));

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor Express activo en puerto ${PORT}`);
});
