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
    const userState = getUserState(sender);
    const isAndroid = msg.key.id?.includes(':');

    if (userState.estado === 'inactivo') {
        console.log('⏸️ Usuario en estado inactivo. No se responde hasta reactivación manual.');
        return;
    }

    console.log(`🧪 ID del mensaje: ${msg.key.id}`);
    console.log(`✅ ¿Cliente Android?: ${isAndroid}`);
    console.log(`📨 Mensaje recibido: ${lowerMsg}`);
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
        lowerMsg?.includes('direccion') ||
        lowerMsg?.includes('ubicacion') ||
        lowerMsg?.includes('donde') ||
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
        lowerMsg?.includes('horario') ||
        lowerMsg?.includes('hora') ||
        lowerMsg?.includes('cuando') ||
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
        lowerMsg?.includes('producto') ||
        lowerMsg?.includes('catalogo') ||
        lowerMsg?.includes('articulo') ||
        lowerMsg?.includes('comprar') ||
        buttonId === 'productos'
    ) {
        console.log('🛒 Solicitud de productos detectada');
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioProductos');
        await sock.sendMessage(sender, {
            text: '🛍️ Puedes ver mis artículos en mi catálogo *AQUÍ*:\n\n👉 https://wa.me/c/5493855075058',
        });
        await sendFollowUp(sock, sender, isAndroid);
        return;
    }

    // 📞 Contacto directo
    if (
        lowerMsg?.includes('pedido') ||
        lowerMsg?.includes('chatear') ||
        lowerMsg?.includes('dueño') ||
        lowerMsg?.includes('pagar') ||
        lowerMsg?.includes('vos') ||
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
        lowerMsg?.includes('chau') ||
        lowerMsg?.includes('nos vemos') ||
        lowerMsg?.includes('no') ||
        lowerMsg?.includes('adios')
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

    const contieneComando = comandosValidos.some(cmd => lowerMsg?.includes(cmd));

    if (!lowerMsg || lowerMsg === '' || (!buttonId && !contieneComando)) {
        console.log('⚠️ Mensaje no reconocido, se envía seguimiento');
        setUserState(sender, 'activo');
        await sock.sendMessage(sender, {
            text: '❓ No entendí tu mensaje. Estas son las opciones disponibles:',
        });
        await sendFollowUp(sock, sender, isAndroid);
        return;
    }

    // 🧠 Respuesta contextual
    setUserState(sender, 'activo');
    const respuesta = responder(sender, lowerMsg);
    await sock.sendMessage(sender, { text: respuesta });
};

module.exports = messageHandler;
