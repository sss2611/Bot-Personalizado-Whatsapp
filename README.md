# 🤖 Bot Personalizado de WhatsApp

## 📌 Descripción general

Bot conversacional desarrollado en Node.js, desplegado en **Render**, con sesión persistente, respuestas automáticas y envío de imágenes. Diseñado para operar sobre un único número de WhatsApp, con arquitectura clara y modular.

---

## 📁 Estructura del proyecto

📁 bot-personalizado-whatsapp/
├── index.js
├── package.json
├── .env
├── auth/
└── /src
     └── handlers/
           └── messageHandler.js
     └── utils/
           └── logger.js
           └── delay.js
     └── config/
          └── env.js
          └── baileys.js
├── 🔐 auth/ → Carpeta de sesión persistente (generada por Baileys)

├── ⚙️ .env → Variables de entorno (ej. AUTHORIZED_NUMBER)
├── 📦 package.json → Dependencias y configuración del proyecto 
├── 🚀 render.yaml → Configuración para despliegue en Render 
└── 📘 README.md → Documentación del proyecto

---

## ⚙️ Tecnologías utilizadas

- **Node.js**  
- **Express**  
- **Baileys** (cliente WhatsApp no oficial)  
- **Render** (hosting 24/7 con protección contra suspensión)  
- **dotenv** para manejo de variables de entorno

---

## 🧠 Funcionalidades implementadas

| Función | Descripción |
|--------|-------------|
| ✅ Sesión persistente | Carpeta `auth/` con reconexión automática |
| ✅ Respuestas automáticas | Controladas desde `replyController.js` |
| ✅ Manejo de mensajes | Filtrado y lógica en `messageHandler.js` |
| ✅ Envío de imágenes | Desde carpeta `media/` según contexto |
| ✅ Validación de número autorizado | Usando variable `AUTHORIZED_NUMBER` en `.env`

---

## 🚀 Despliegue en Render

### 1. Requisitos

- Repositorio en GitHub  
- Archivo `render.yaml` en raíz del proyecto  
- Carpeta `auth/` con sesión activa (no vacía)

### 2. Configuración básica

```yaml
services:
  - type: web
    name: whatsapp-bot
    env: node
    plan: starter
    buildCommand: ""
    startCommand: "node index.js"
    autoDeploy: true

📈 Estado actual
Bot operativo y estable

Flujo básico validado

Listo para escalar con lógica de pagos, monitoreo visual y backup externo

## 📦 Escalabilidad y operación comercial

Este bot está diseñado para evolucionar hacia una solución robusta y comercial. A continuación se detallan los pasos recomendados para escalarlo:

### 🔁 Backup automático de sesión

- Implementar script que copie `auth_info.json` cada 12h a carpeta `backup/`
- Usar `cron` o librerías como `node-cron` para automatizar

```js
const fs = require('fs');
const cron = require('node-cron');

cron.schedule('0 */12 * * *', () => {
  fs.copyFileSync('./auth/auth_info.json', `./backup/auth_${Date.now()}.json`);
});

Portada

Título: “Bot Personalizado para WhatsApp”

Subtítulo: “Sesión persistente, respuestas automáticas e imágenes configuradas”

Íconos: WhatsApp, Node.js, Render

Resumen técnico

Arquitectura: Node.js + Express + Baileys

Despliegue: Render con sesión persistente

Estructura modular: index.js, messageHandler, replyController

Imágenes: Carpeta media/ con 4 archivos

Funcionalidades clave

✅ Respuestas automáticas

✅ Manejo de comprobantes básicos

✅ Envío de imágenes

✅ Validación de número autorizado

✅ Endpoint /status

Despliegue en Render

YAML simplificado

Variables de entorno

Logs y protección contra suspensión

Escalabilidad

Backup automático de sesión

Logs visuales

Endpoint /metrics

Preparado para múltiples instancias

Estado actual

Bot operativo

Flujo validado

Listo para escalar