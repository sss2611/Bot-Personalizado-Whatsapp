# 🤖 Bot Personalizado de WhatsApp

Bot modular y persistente para WhatsApp, construido con [Baileys](https://github.com/WhiskeySockets/Baileys). Responde automáticamente a mensajes, envía imágenes, y se mantiene conectado a un número fijo. Ideal para despliegue en Render.

---

## 🚀 Características

- ✅ Sesión persistente con reconexión automática
- ✅ Respuestas automáticas por texto
- ✅ Envío de imágenes desde carpeta local
- ✅ Filtro por número autorizado
- ✅ Compatible con Render (Express activo)
- ✅ Modular y fácil de mantener

---

## 📁 Estructura del proyecto

Bot-Personalizado-WhatsApp/ 
├── 📄 index.js → Lógica principal del bot + servidor Express 
├── 📄 messageHandler.js → Manejo de mensajes entrantes 
├── 📄 replyController.js → Controlador de respuestas automáticas

├── 🖼️ media/ → Imágenes enviadas por el bot 
│ ├── 1.jpg 
│ ├── 2.jpg
│ ├── 3.jpg 
│ └── 4.jpg

├── 🔐 auth/ → Carpeta de sesión persistente (generada por Baileys)

├── ⚙️ .env → Variables de entorno (ej. AUTHORIZED_NUMBER)
├── 📦 package.json → Dependencias y configuración del proyecto 
├── 🚀 render.yaml → Configuración para despliegue en Render 
└── 📘 README.md → Documentación del proyecto

---

## ⚙️ Instalación local

```bash
git clone https://github.com/tu-usuario/bot-personalizado-whatsapp.git
cd bot-personalizado-whatsapp
npm install

🧪 Ejecución local
bash
node index.js
Escaneá el QR desde tu número autorizado. El bot responderá solo a ese número.

☁️ Despliegue en Render
Subí el proyecto a GitHub

En Render, creá un nuevo Web Service

Asegurate de incluir render.yaml

El bot se mantendrá activo gracias a Express

📬 Comandos disponibles
hola → Saludo + imágenes de productos

info → Enlace a Facebook

precio → Consulta de precios

🪵 Marca
Somos EsTODOMADERA: madera que dura, confianza que crece 💫