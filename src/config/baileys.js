// src/config/baileys.js
require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const delay = ms => new Promise(res => setTimeout(res, ms));

const messageHandler = require('../handlers/messageHandler');

const AUTH_FOLDER = path.resolve(__dirname, '../../auth');

if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER);

const startBot = async () => {
    console.log('⏳ Inicializando cliente...');

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`📦 Usando versión de WhatsApp Web: ${version.join('.')}${isLatest ? ' (última)' : ''}`);

    const sock = makeWASocket({
        version,
        auth: state,
        browser: ['Bot Personalizado', 'Chrome', '120'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) qrcode.generate(qr, { small: true });

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

            const { platform, device } = sock.authState.creds;
            console.log(`🧪 Sesión actual: ${platform} (${device})`);

            if (platform !== 'android') {
                console.warn('⚠️ Esta sesión no es compatible con botones interactivos.');
            } else {
                console.log('✅ Sesión compatible con botones interactivos.');
            }
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

module.exports = startBot;
