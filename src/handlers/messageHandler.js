// src/handlers/messageHandler.js
const delay = require('../utils/delay');
const logger = require('../utils/logger');
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

// 🎯 Mapeo de números y palabras
const opcionesNumericas = {
    '1': 'productos', 'uno': 'productos',
    '2': 'direccion', 'dos': 'direccion',
    '3': 'horarios', 'tres': 'horarios',
    '4': 'pedido', 'cuatro': 'pedido',
    '5': 'dueno', 'cinco': 'dueno',
    '6': 'ayuda', 'seis': 'ayuda'
};

const messageHandler = async (sock, msg) => {
    const sender = msg.key.remoteJid;
    const message = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const buttonId = msg.message?.buttonsResponseMessage?.selectedButtonId ||
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text;
    const isReply = !!quotedText;
    const isReplyToProduct =
        quotedMsg?.productMessage ||
        quotedText?.includes('wa.me/c/') ||
        quotedText?.startsWith('*') ||
        quotedText?.toLowerCase().includes('estantería') ||
        quotedText?.toLowerCase().includes('madera');

    const lowerMsg = message?.toLowerCase().trim();
    let contexto = isReply ? `${quotedText.toLowerCase().trim()} → ${lowerMsg}` : lowerMsg;

    // 🎯 Interpretar número o palabra como comando
    if (opcionesNumericas[contexto]) {
        logger.evento('NUMERO_RECONOCIDO', `Usuario ${sender} envió "${contexto}" → interpretado como "${opcionesNumericas[contexto]}"`);
        contexto = opcionesNumericas[contexto];
    }

    const userState = getUserState(sender);
    const isAndroid = msg.key.id?.includes(':');

    if (!message && !buttonId) return;

    if (userState.estado === 'inactivo') {
        console.log('⏸️ Usuario en estado inactivo. No se responde hasta reactivación manual.');
        return;
    }

    console.log(`🧪 ID del mensaje: ${msg.key.id}`);
    console.log(`✅ ¿Cliente Android?: ${isAndroid}`);
    console.log(`📨 Mensaje recibido: ${lowerMsg}`);
    console.log(`🧠 Contexto interpretado: ${contexto}`);
    console.log('📊 Estado actual del usuario:', debeEnviarSaludo(sender) ? 'sin saludo' : 'ya saludado');

    // 📦 Mensaje desde el catálogo (prioridad absoluta)
    if (isReplyToProduct) {
        setUserState(sender, 'inactivo');
        marcarPedido(sender, 'mensajeDesdeCatalogo');

        const nombreProducto = quotedMsg?.productMessage?.product?.name ||
            quotedText?.split('\n')[0]?.replace(/\*/g, '').trim() ||
            'Producto desconocido';

        const comentarioUsuario = message?.trim() || '(sin mensaje)';

        logger.evento('MENSAJE_DESDE_CATALOGO', {
            usuario: sender,
            producto: nombreProducto,
            comentario: comentarioUsuario
        });

        await sock.sendMessage(sender, {
            text: '📞 En un momento me comunico con vos.',
        });

        const timeoutMin = parseInt(process.env.USER_INACTIVITY_TIMEOUT_MINUTES, 10) || 30;
        delay(timeoutMin * 60 * 1000, `Reactivación de ${sender}`).then(async () => {
            setUserState(sender, 'activo');
            logger.evento('REACTIVACIÓN', `Usuario ${sender} reactivado automáticamente tras ${timeoutMin} minutos (mensaje desde catálogo)`);

            await sock.sendMessage(sender, {
                text: '👋 ¡Estoy de vuelta!\n¿Querés seguir explorando el catálogo o hacer otra consulta?',
            });

            await sendMenuTexto(sock, sender);
        });

        return;
    }

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
        contexto?.includes('direccion') || contexto?.includes('ubicacion') || contexto?.includes('donde') ||
        buttonId === 'direccion'
    ) {
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioDireccion');
        await sock.sendMessage(sender, {
            text: '📍 Estamos en *Pje San Lorenzo 1261*\n\nUbicación: https://www.google.com.ar/maps/@-27.7988078,-64.2590085,20.92z?entry=ttu',
        });
        await sendFollowUp(sock, sender, isAndroid);
        return;
    }

    // 🕒 Horarios
    if (
        contexto?.includes('horario') || contexto?.includes('hora') || contexto?.includes('cuando') ||
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
        contexto?.includes('producto') || contexto?.includes('catalogo') || contexto?.includes('articulo') ||
        contexto?.includes('comprar') || buttonId === 'productos'
    ) {
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioProductos');
        await sock.sendMessage(sender, {
            text: '🛍️ Puedes ver los artículos disponibles en mi catálogo:\n\n👉 *https://wa.me/c/5493855941088*',
        });
        await sendFollowUp(sock, sender, isAndroid);
        return;
    }

    // 📞 Contacto directo
    if (
        contexto?.includes('pedido') || contexto?.includes('chatear') || contexto?.includes('dueño') ||
        contexto?.includes('pagar') || contexto?.includes('vos') ||
        buttonId === 'pedido' || buttonId === 'dueno' || buttonId === 'pagar'
    ) {
        setUserState(sender, 'inactivo');
        marcarPedido(sender, 'pidioContacto');
        await sock.sendMessage(sender, {
            text: '📞 En un momento me comunico con vos.',
        });

        const timeoutMin = parseInt(process.env.USER_INACTIVITY_TIMEOUT_MINUTES, 10) || 30;
        delay(timeoutMin * 60 * 1000, `Reactivación de ${sender}`).then(async () => {
            setUserState(sender, 'activo');
            logger.evento('REACTIVACIÓN', `Usuario ${sender} reactivado automáticamente tras ${timeoutMin} minutos (contacto directo)`);

            await sock.sendMessage(sender, {
                text: '👋 ¡Estoy de vuelta!\n¿Querés seguir explorando el catálogo o hacer otra consulta?',
            });

            await sendMenuTexto(sock, sender);
        });

        return;
    }

    // 👋 Despedida
    if (
        contexto?.includes('chau') || contexto?.includes('nos vemos') ||
        contexto?.includes('no') || contexto?.includes('adios')
    ) {
        setUserState(sender, 'inactivo');
        await sock.sendMessage(sender, {
            text: '👋 Hasta luego, que tengas buen día!',
        });

        const timeoutMin = parseInt(process.env.USER_INACTIVITY_TIMEOUT_MINUTES, 10) || 30;
        delay(timeoutMin * 60 * 1000, `Reactivación de ${sender}`).then(async () => {
            setUserState(sender, 'activo');
            logger.evento('REACTIVACIÓN', `Usuario ${sender} reactivado automáticamente tras ${timeoutMin} minutos (despedida)`);

            await sock.sendMessage(sender, {
                text: '👋 ¡Estoy de vuelta!\n¿Querés seguir explorando el catálogo o hacer otra consulta?',
            });

            await sendMenuTexto(sock, sender);
        });

        return;
    }

    // 🧾 Fallback
    const comandosValidos = Object.values(opcionesNumericas).concat([
        'menu', 'chau', 'nos vemos', 'no', 'hola', 'pedido', 'chatear', 'dueño', 'comprar', 'pagar', 'vos'
    ]);
    const contieneComando = comandosValidos.some(cmd => contexto?.includes(cmd));

    if (!contexto || contexto === '' || (!buttonId && !contieneComando)) {
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
