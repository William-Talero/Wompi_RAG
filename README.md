# Wompi RAG Service

Sistema RAG (Retrieval-Augmented Generation) para Wompi utilizando LanceDB como base de datos vectorial.

## Características

- 🔍 **Búsqueda Semántica**: Búsqueda vectorial con LanceDB
- 🤖 **Generación de Respuestas**: Integration con OpenAI GPT para respuestas contextuales
- 📄 **Procesamiento de Documentos**: Soporte para texto plano y PDFs
- 🏗️ **Clean Architecture**: Estructura siguiendo principios SOLID
- 🔒 **Validación**: Middleware de validación con Joi
- 📊 **Monitoreo**: Logging y health checks

## Estructura del Proyecto

```
proyecto/
├── src/
│   ├── domain/                    # Entidades y casos de uso
│   ├── infrastructure/           # Implementaciones externas (LanceDB, OpenAI)
│   ├── application/             # Servicios de aplicación
│   ├── presentation/           # Controllers, rutas y middlewares
│   └── shared/                # Configuración y utilidades
├── data/                      # Datos iniciales (separados del código)
│   └── knowledge/
│       └── wompi_knowledge.txt   # Información base sobre Wompi
├── vectors/                   # Base de datos vectorial LanceDB
├── package.json
└── README.md
```

## Instalación

1. Clona el repositorio
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Configura variables de entorno:
   ```bash
   cp .env.example .env
   # Edita .env con tu API key de OpenAI
   ```

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## API Endpoints

### Documentación
- `GET /api-docs` - Documentación Swagger interactiva

### Inicialización
- `POST /api/v1/initialize` - Inicializar base de datos vectorial y cargar datos iniciales de Wompi

### Documentos
- `POST /api/v1/documents/text` - Agregar documento de texto
- `POST /api/v1/documents/pdf` - Agregar documento PDF

### Búsqueda
- `POST /api/v1/search` - Búsqueda vectorial
- `POST /api/v1/chat` - Chat con respuestas contextuales

### Health Check
- `GET /api/v1/health` - Estado del servicio

## Ejemplos de Uso

### Agregar Documento
```json
POST /api/v1/documents/text
{
  "content": "Wompi es una pasarela de pagos...",
  "title": "Información Wompi",
  "category": "knowledge_base"
}
```

### Búsqueda con Chat
```json
POST /api/v1/chat
{
  "query": "¿Cómo funciona Wompi?",
  "category": "knowledge_base"
}
```

## Datos Iniciales

El sistema incluye una base de conocimiento inicial sobre Wompi ubicada en `data/knowledge/wompi_knowledge.txt`. Esta información se carga automáticamente la primera vez que se ejecuta el endpoint `/initialize` e incluye:

- Información general sobre Wompi
- Características y funcionalidades
- Métodos de pago disponibles
- Proceso de integración
- Seguridad y cumplimiento
- Tarifas y beneficios
- Casos de uso

### Agregar más datos iniciales:
1. Coloca archivos `.txt` en la carpeta `data/knowledge/`
2. Ejecuta el endpoint `/initialize`
3. El sistema detectará y cargará automáticamente los nuevos archivos

### Ventajas de esta estructura:
- ✅ Separación clara entre código y datos
- ✅ Los datos no se incluyen en el bundle compilado
- ✅ Fácil gestión independiente del contenido
- ✅ Escalable para datasets grandes

### Categorías de contenido:
El sistema utiliza categorías para organizar la información:
- `knowledge_base` - Categoría por defecto para datos iniciales
- `integration` - Guías de integración técnica
- `api` - Documentación de la API
- `pricing` - Información de tarifas
- `security` - Seguridad y cumplimiento

Puedes filtrar búsquedas por categoría para obtener resultados más precisos.

## Configuración

Variables de entorno:
- `OPENAI_API_KEY` (requerida): API key de OpenAI. Obtén la tuya en [OpenAI Platform](https://platform.openai.com/api-keys)
- `PORT` (opcional): Puerto del servidor, default: 3000

## Licencia

Este proyecto está licenciado bajo la licencia ISC.

## Contacto

**Creador**: William Andres Talero Cifuentes

Si tienes alguna pregunta o problema, por favor, abre un issue en el repositorio.