# Knowledge Base

Esta carpeta contiene los archivos de conocimiento inicial que se cargan automáticamente en la base de datos vectorial.

## Cómo funciona

1. Coloca archivos `.txt` en esta carpeta
2. Ejecuta `POST /api/v1/initialize` 
3. El sistema procesará automáticamente todos los archivos `.txt`

## Archivos incluidos

- `wompi_knowledge.txt` - Información base sobre Wompi (productos, servicios, integración, etc.)

## Agregar nuevo contenido

Para agregar más información a la base de conocimiento:

1. Crea archivos `.txt` con el contenido
2. Usa nombres descriptivos (ej: `wompi_api_docs.txt`, `wompi_faq.txt`)
3. El contenido se dividirá automáticamente en chunks optimizados para búsqueda
4. Ejecuta el inicializador para cargar los nuevos archivos

## Estructura recomendada

```
knowledge/
├── wompi_knowledge.txt      # Información general
├── wompi_api_docs.txt       # Documentación API
├── wompi_integration.txt    # Guías de integración
├── wompi_faq.txt           # Preguntas frecuentes
└── wompi_support.txt       # Información de soporte
```

## Notas importantes

- Solo archivos `.txt` son procesados automáticamente
- El contenido debe estar en texto plano
- Evita caracteres especiales que puedan afectar el procesamiento
- Los archivos grandes se dividen automáticamente en chunks