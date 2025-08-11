// index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const messageHandler = require('./messageHandler');

// 🟢 Inicializa el bot
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

    // 🚫 Ignorar mensajes enviados por el bot
    if (msg.key.fromMe) {
      console.log('🔁 Mensaje enviado por el bot. Ignorado.');
      continue;
    }

    // 🚫 Ignorar mensajes reenviados, de distribución o de protocolo
    const isSystem = msg.message?.protocolMessage || msg.message?.senderKeyDistributionMessage;
    if (isSystem) {
      console.log('📦 Mensaje del sistema. Ignorado.');
      continue;
    }

    // 🚫 Ignorar mensajes antiguos (solo responder a tipo 'notify')
    if (type !== 'notify') {
      console.log(`⏳ Tipo de mensaje no es 'notify' (${type}). Ignorado.`);
      continue;
    }

    try {
      await messageHandler(sock, msg);
    } catch (err) {
      console.error('❌ Error en messageHandler:', err);
    }
  }
});


};

startBot();

// 🌐 Servidor Express para mantener activo en Render
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('🤖 Bot de WhatsApp activo');
});

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT)
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = PORT + 1;
      console.log(`⚠️ Puerto ${PORT} ocupado. Probando con ${fallbackPort}...`);
      server.listen(fallbackPort, () => {
        console.log(`🚀 Servidor Express activo en puerto ${fallbackPort}`);
      });
    } else {
      throw err;
    }
  })
  .on('listening', () => {
    console.log(`🚀 Servidor Express activo en puerto ${PORT}`);
  });
