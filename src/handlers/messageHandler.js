// src/handlers/messageHandler.js
const { sendFollowUp } = require('../utils/sendFollowUp');
const { sendMenuTexto } = require('../utils/buttonManager');
const { responder } = require('../core/contextualResponder');
const {
    setUserState,
    getUserState,
    debeEnviarSaludo,
    marcarSaludo,
    marcarPedido
} = require('../core/userStateManager');

const messageHandler = async (sock, msg) => {
    const sender = msg.key.remoteJid;
    const message = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const buttonId = msg.message?.buttonsResponseMessage?.selectedButtonId || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;

    if (!message && !buttonId) return;

    const lowerMsg = message?.toLowerCase().trim();
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text;
    const isReply = !!quotedText;
    const contexto = isReply ? `${quotedText.toLowerCase().trim()} → ${lowerMsg}` : lowerMsg;

    const userState = getUserState(sender);
    const isAndroid = msg.key.id?.includes(':');

    if (userState.estado === 'inactivo') {
        console.log('⏸️ Usuario en estado inactivo. No se responde hasta reactivación manual.');
        return;
    }

    console.log(`🧪 ID del mensaje: ${msg.key.id}`);
    console.log(`✅ ¿Cliente Android?: ${isAndroid}`);
    console.log(`📨 Mensaje recibido: ${lowerMsg}`);
    console.log(`🧠 Contexto interpretado: ${contexto}`);
    console.log('📊 Estado actual del usuario:', debeEnviarSaludo(sender) ? 'sin saludo' : 'ya saludado');

    // 🧠 Saludo inicial
    if (debeEnviarSaludo(sender)) {
        await sock.sendMessage(sender, {
            text: '👋 Bienvenido a *EsTODOMADERA*\n📦 Estanterías de madera a medida — ¡Listas para entrega inmediata!\n¿Qué deseas saber?',
        });
        await sendMenuTexto(sock, sender);
        marcarSaludo(sender);
        return;
    }

    // 📍 Dirección
    if (
        contexto?.includes('direccion') ||
        contexto?.includes('ubicacion') ||
        contexto?.includes('donde') ||
        buttonId === 'direccion'
    ) {
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioDireccion');
        await sock.sendMessage(sender, {
            text: '📍 Estamos en *Pje San Lorenzo 1261*\n\nUbicación: https://www.google.com.ar/maps/@-27.7988078,-64.2590085,20.92z?entry=ttu&g_ep=EgoyMDI1MDgxMS4wIKXMDSoASAFQAw%3D%3D',
        });
        await sendFollowUp(sock, sender, isAndroid);
        return;
    }

    // 🕒 Horarios
    if (
        contexto?.includes('horario') ||
        contexto?.includes('hora') ||
        contexto?.includes('cuando') ||
        buttonId === 'horarios'
    ) {
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioHorarios');
        await sock.sendMessage(sender, {
            text: '🕒 Nuestros horarios de atención son:\n\nLunes a Viernes: 9:00 a 18:00\nSábados: 9:00 a 13:00',
        });
        await sendFollowUp(sock, sender, isAndroid);
        return;
    }

    // 🛍️ Productos
    if (
        contexto?.includes('producto') ||
        contexto?.includes('catalogo') ||
        contexto?.includes('articulo') ||
        contexto?.includes('comprar') ||
        buttonId === 'productos'
    ) {
        console.log('🛒 Solicitud de productos detectada');
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioProductos');
        await sock.sendMessage(sender, {
            text: '🛍️ Puedes ver los artículos disponibles en mi catálogo:\n\n 👉 *https://wa.me/c/5493855941088*',
        });
        await sendFollowUp(sock, sender, isAndroid);
        return;
    }

    // 📞 Contacto directo
    if (
        contexto?.includes('pedido') ||
        contexto?.includes('chatear') ||
        contexto?.includes('dueño') ||
        contexto?.includes('pagar') ||
        contexto?.includes('vos') ||
        buttonId === 'pedido' ||
        buttonId === 'dueno' ||
        buttonId === 'pagar'
    ) {
        setUserState(sender, 'inactivo');
        marcarPedido(sender, 'pidioContacto');
        await sock.sendMessage(sender, {
            text: '📞 En un momento me comunico con vos.',
        });
        return;
    }

    // 👋 Despedida
    if (
        contexto?.includes('chau') ||
        contexto?.includes('nos vemos') ||
        contexto?.includes('no') ||
        contexto?.includes('adios')
    ) {
        setUserState(sender, 'inactivo');
        await sock.sendMessage(sender, {
            text: '👋 Hasta luego, que tengas buen día!',
        });
        return;
    }

    // 🧾 Fallback
    const comandosValidos = [
        'producto', 'direccion', 'horario', 'ayuda', 'menu', 'chau',
        'nos vemos', 'no', 'hola', 'pedido', 'chatear', 'dueño', 'comprar', 'pagar', 'vos'
    ];

    const contieneComando = comandosValidos.some(cmd => contexto?.includes(cmd));

    if (!contexto || contexto === '' || (!buttonId && !contieneComando)) {
        console.log('⚠️ Mensaje no reconocido, se envía seguimiento');
        setUserState(sender, 'activo');
        await sendFollowUp(sock, sender, isAndroid);
        return;
    }

    // 🧠 Respuesta contextual
    setUserState(sender, 'activo');
    const respuesta = responder(sender, contexto);
    await sock.sendMessage(sender, { text: respuesta });
};

module.exports = messageHandler;

