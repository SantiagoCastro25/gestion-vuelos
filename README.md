# SkyAI — Plataforma Global de Vuelos con Inteligencia Artificial

¡Bienvenido a SkyAI! Esta es una plataforma web moderna para buscar vuelos, hoteles y predecir los mejores precios de viaje usando Inteligencia Artificial.

## ⚠️ Adiós a XAMPP: Nueva Arquitectura

El proyecto anterior basado en PHP y MySQL ha sido **completamente reemplazado**. 

**¿Sigo necesitando XAMPP?**
**¡NO! Ya no necesitas XAMPP, ni Apache, ni MySQL.** 

El proyecto ahora está construido con **Next.js**, una tecnología moderna basada en Node.js que incluye tanto el servidor (Backend) como la interfaz web (Frontend) en un solo lugar. 

**Tampoco necesitas simplemente abrir un `.html`**. Las aplicaciones modernas de React/Next.js necesitan compilarse y servirse a través de su propio servidor de desarrollo integrado. Sigue las instrucciones a continuación para arrancar la aplicación correctamente.

---

## 🚀 Cómo ejecutar SkyAI

Dado que ya no usamos XAMPP, el proceso para iniciar la aplicación es diferente pero muy sencillo:

### Requisitos Previos
1. Necesitas tener instalado **Node.js** en tu computadora. Puedes descargarlo e instalarlo desde [nodejs.org](https://nodejs.org/).
2. Asegúrate de tener una terminal abierta (como PowerShell o la terminal integrada de VS Code).

### Pasos para iniciar

1. **Abre tu terminal** y navega a la nueva carpeta del proyecto llamada `skyai`:
   ```bash
   cd skyai
   ```

2. **Inicia el servidor de desarrollo** ejecutando el siguiente comando:
   ```bash
   npm run dev
   ```

3. **Abre tu navegador web** y dirígete a:
   👉 **[http://localhost:3000](http://localhost:3000)**

¡Eso es todo! La plataforma SkyAI se cargará en tu navegador. 

> *Nota: Si ves un error de permisos al ejecutar comandos en PowerShell, puedes solucionarlo temporalmente abriendo PowerShell como Administrador y ejecutando: `Set-ExecutionPolicy RemoteSigned`.*

---

## ⚙️ Configuración de APIs (Opcional)

Actualmente, la aplicación está configurada con **Datos de Prueba (Mock Data)**. Esto significa que **puedes probar todas las pantallas, el chatbot y ver los resultados sin necesidad de configurar nada más**.

Sin embargo, si quieres conectarlo a datos reales del mundo real, necesitarás añadir tus propias "API Keys". Puedes hacerlo editando el archivo `.env.local` ubicado en la carpeta `/skyai`:

1. **Búsqueda de Vuelos y Hoteles reales:** Regístrate en [RapidAPI](https://rapidapi.com), busca la API "Sky Scrapper" y obtén una llave gratuita.
2. **Chatbot y Predicción con IA real:** Necesitas una clave de [OpenAI](https://platform.openai.com/api-keys).
3. **Inicio de sesión real con Google:** Configura un proyecto en Google Cloud Console para usar OAuth 2.0.

> *Dentro del archivo `skyai/.env.local` encontrarás instrucciones más detalladas sobre cómo obtener cada clave si decides usarlas.*

---

## 🏗️ Estructura del Proyecto (`/skyai`)

- **`/app`**: Contiene todas las páginas de la aplicación (Inicio, Resultados, Login, Hoteles, etc.) y las rutas de la API (Backend).
- **`/components`**: Contiene los bloques de construcción visuales de la aplicación.
  - `/ai`: Componentes de Inteligencia Artificial (Chatbot y Predicción de precios).
  - `/search`: El formulario de búsqueda inteligente.
  - `/results`: Las tarjetas de vuelos y hoteles.
  - `/layout`: La barra de navegación.

¡Disfruta construyendo el futuro de los viajes con SkyAI! 🛫🤖