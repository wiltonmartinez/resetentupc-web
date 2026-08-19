# ResetEnLinea-Site — Especificación inicial para el proyecto Astro

## 1. Propósito

Este documento define la base inicial del nuevo sitio público de **ResetEnLinea**, construido desde cero con **Astro**.

El objetivo **no es copiar el sitio anterior**. El objetivo es construir una estructura superior que:

- Mejore la arquitectura SEO.
- Preserve el valor y tráfico SEO existente.
- Permita redirigir posteriormente las URLs antiguas a la nueva estructura.
- Evite contenido y URLs duplicadas.
- Priorice clientes con alta intención transaccional.
- Ofrezca una experiencia clara, profesional y segura.
- Se adapte al idioma del visitante.
- Centralice configuraciones y componentes reutilizables.
- Prepare el sitio para trazabilidad, automatización y un backend futuro.

---

## 2. Regla crítica antes de escribir o modificar

Antes de realizar cualquier operación que cree, modifique, sobrescriba, elimine, mueva o renombre archivos, se debe informar primero:

1. Qué se va a hacer.
2. Qué archivos se crearán.
3. Qué archivos existentes se modificarán.
4. La ruta exacta de cada archivo.
5. Si se sobrescribirá contenido existente.
6. Si se eliminará algún archivo.
7. El impacto esperado.

Después se debe esperar autorización explícita.

Una vez autorizado un bloque completo, puede ejecutarse sin pedir autorización archivo por archivo.

Al terminar, se debe informar:

- Archivos creados.
- Archivos modificados.
- Archivos eliminados.
- Resultado de verificaciones.
- Problemas encontrados.

### Operaciones que no requieren autorización previa

- Leer archivos.
- Analizar código.
- Inspeccionar directorios.
- Revisar configuración.
- Buscar inconsistencias.
- Analizar logs.
- Proponer cambios.

### Operaciones que sí requieren autorización previa

- Crear archivos.
- Editar archivos.
- Sobrescribir archivos.
- Eliminar archivos.
- Mover archivos.
- Renombrar archivos.
- Instalar dependencias que modifiquen el proyecto.
- Ejecutar comandos que generen archivos.
- Aplicar redirecciones.
- Conectar servicios externos.

---

## 3. Separación de proyectos

### Nuevo sitio

```text
ResetEnLinea-Site
```

Es exclusivamente el nuevo sitio público construido con Astro.

### Proyecto de auditoría

Existe un proyecto separado:

```text
ResetEnLinea-SEO-Audit
```

Contiene:

- Auditoría SEO.
- Inventario de URLs.
- Base de conocimiento.
- Marcas y modelos.
- Datos históricos.
- Análisis de tráfico.
- Decisiones de arquitectura.
- Mapa de migración SEO.

Desde `ResetEnLinea-Site` se puede leer información del proyecto de auditoría, pero **nunca se debe escribir, modificar ni eliminar nada dentro de `ResetEnLinea-SEO-Audit`**.

Los datos necesarios deben copiarse o importarse al nuevo proyecto.

El sitio no debe depender en tiempo de ejecución de la carpeta de auditoría.

```text
ResetEnLinea-SEO-Audit
        ↓
   solo lectura
        ↓
ResetEnLinea-Site
```

### ResetHUB

`ResetHUB` pertenece a la arquitectura anterior y utiliza WooCommerce.

Queda obsoleto y fuera del alcance de este proyecto.

No reutilizar:

- WooCommerce.
- WordPress.
- Plantillas antiguas.
- Lógica antigua.
- Dependencias antiguas.
- Estructuras de ResetHUB.

El nuevo sitio público se construirá directamente con Astro.

---

## 4. Buyer persona y tráfico prioritario

El sitio debe estar orientado a clientes que:

- Buscan una solución profesional.
- Priorizan la seguridad de sus dispositivos.
- No quieren experimentar con programas desconocidos.
- No quieren desactivar el antivirus.
- No quieren perder tiempo buscando soluciones gratuitas.
- Prefieren seguir instrucciones claras.
- Valoran su tiempo.
- Buscan asistencia profesional.
- Tienen intención real de resolver el problema.

No optimizar el sitio únicamente para atraer tráfico que solo busca:

- Reset gratis.
- Descargas gratuitas.
- Crack.
- Programas ilegales.
- Soluciones para experimentar sin asistencia.

El diagnóstico gratuito y los recursos gratuitos pueden utilizarse para:

- Generar confianza.
- Reducir incertidumbre.
- Permitir diagnóstico.
- Demostrar profesionalismo.

No deben utilizarse únicamente para atraer tráfico irrelevante.

La métrica importante no es solamente conseguir visitas:

```text
Tráfico cualificado
        ↓
Diagnóstico
        ↓
Compatibilidad
        ↓
Contacto
        ↓
Conversación
        ↓
Solución adecuada
        ↓
Pago
        ↓
Servicio
        ↓
Garantía
```

---

## 5. Modalidades de servicio

La modalidad no debe presentarse inicialmente como un menú de opciones.

El cliente llega con un problema y primero se debe identificar:

- Marca.
- Modelo.
- Error o problema.
- Requisitos técnicos.
- Compatibilidad.

Flujo:

```text
Cliente llega con un problema
        ↓
Se identifica marca/modelo/error
        ↓
Se evalúan requisitos
        ↓
Se determina compatibilidad
        ↓
Se aplica la modalidad adecuada
```

### Modalidad predeterminada

Siempre que el cliente cumpla los requisitos, la modalidad preferida es:

```text
Reset Asistido 100% Remoto por conexión USB
```

### Alternativa

Solo si el cliente no cumple requisitos, necesita otra alternativa o insiste en una solución autónoma, se puede evaluar:

```text
Reset Autónomo 100% Local por conexión USB
```

La modalidad es un resultado de la evaluación.

No debe ser la primera decisión que se exige tomar al cliente.

No construir la arquitectura SEO alrededor de páginas públicas de modalidades.

---

## 6. Arquitectura SEO aprobada

La estructura principal aprobada para páginas de modelos es:

```text
/reset/{marca}/{modelo}/
```

Ejemplos:

```text
/reset/epson/l1250/
/reset/canon/g6010/
/reset/epson-sc/t3170/
/reset/canon/mb5150/
```

La familia puede existir como:

- Dato.
- Navegación.
- Breadcrumb.
- Organización editorial.
- Relación entre modelos.

Pero no debe aparecer obligatoriamente en la URL.

Principio:

```text
Jerarquía de datos ≠ navegación ≠ URL
```

---

## 7. Modelos iniciales para validar la plantilla

No generar todavía aproximadamente 420 páginas.

Primero validar la arquitectura utilizando cuatro modelos:

| Marca | Modelo | Nivel | Motivo |
|---|---|---:|---|
| Epson | L1250 | 1 | Mayor tráfico |
| Canon | G6010 | 1 | Caso Canon documentado |
| Epson-SC | T3170 | 2 | Validar slug sin repetir `sc-` |
| Canon | MB5150 | 3 | Validar cobertura de cola larga |

---

## 8. Idiomas

El sitio debe soportar inicialmente:

1. Español Latinoamericano.
2. Inglés.
3. Portugués.
4. Francés.
5. Italiano.

### Idioma predeterminado

```text
Español Latinoamericano
```

Código SEO:

```text
es-419
```

### Estructura de URLs

Español sin prefijo:

```text
https://resetenlinea.com/reset/epson/l1250/
```

Inglés:

```text
https://resetenlinea.com/en/reset/epson/l1250/
```

Portugués:

```text
https://resetenlinea.com/pt/reset/epson/l1250/
```

Francés:

```text
https://resetenlinea.com/fr/reset/epson/l1250/
```

Italiano:

```text
https://resetenlinea.com/it/reset/epson/l1250/
```

Las marcas y modelos son identificadores técnicos y permanecen iguales entre idiomas.

---

## 9. Detección de idioma

Se puede detectar el idioma preferido del navegador.

No se debe hacer una redirección automática forzada basada únicamente en el idioma detectado.

La URL solicitada debe permanecer disponible y estable.

Ejemplo:

```text
/reset/epson/l1250/
```

siempre representa la versión en español.

Si se detecta un idioma soportado diferente, se puede mostrar una sugerencia no intrusiva para visitar la versión correspondiente.

El usuario puede seleccionar manualmente:

- Español.
- English.
- Português.
- Français.
- Italiano.

La selección manual tiene prioridad sobre la detección automática y debe recordarse.

---

## 10. SEO multilingüe

Cada idioma debe tener una página independiente e indexable.

No utilizar:

```text
?lang=en
```

Cada página debe tener:

- Canonical auto-referenciado.
- Title propio.
- Meta description propia.
- Open Graph propio.
- `hreflang`.
- `x-default`.

Ejemplo conceptual:

```html
<link rel="alternate" hreflang="es-419" href="https://resetenlinea.com/reset/epson/l1250/" />
<link rel="alternate" hreflang="en" href="https://resetenlinea.com/en/reset/epson/l1250/" />
<link rel="alternate" hreflang="pt" href="https://resetenlinea.com/pt/reset/epson/l1250/" />
<link rel="alternate" hreflang="fr" href="https://resetenlinea.com/fr/reset/epson/l1250/" />
<link rel="alternate" hreflang="it" href="https://resetenlinea.com/it/reset/epson/l1250/" />
<link rel="alternate" hreflang="x-default" href="https://resetenlinea.com/reset/epson/l1250/" />
```

Cada versión debe incluir su propia referencia dentro del conjunto de `hreflang`.

---

## 11. WhatsApp centralizado

El número de WhatsApp debe controlarse desde un único punto de configuración.

Número:

```text
573016928346
```

Ejemplo:

```text
src/config/site.ts
```

Debe contener:

```text
WHATSAPP_NUMBER = "573016928346"
```

El número no debe escribirse manualmente en cada página o componente.

Todos los CTA deben obtenerlo desde la configuración central.

---

## 12. CTA contextual de WhatsApp

Debe existir un componente reutilizable, por ejemplo:

```text
WhatsAppCTA.astro
```

Debe aceptar contexto como:

```text
marca
modelo
error
sourceId
urlPath
locale
label
```

El CTA debe generar mensajes dinámicos según el contenido desde el cual se originó el contacto.

No utilizar el mismo mensaje genérico para todas las páginas.

---

## 13. Mensaje inicial de WhatsApp

Cuando se conoce el error:

```text
Hola, necesito ayuda para realizar el reset de mi {marca} {modelo}.

El problema o error que presenta es: {error}.

Vengo desde:
{url_origen}
```

Cuando no se conoce el error:

```text
Hola, necesito ayuda para realizar el reset de mi {marca} {modelo}.

Vengo desde:
{url_origen}
```

No incluir automáticamente la modalidad en el mensaje inicial.

La modalidad debe determinarse después de evaluar:

- Equipo.
- Sistema.
- Conexión.
- Requisitos.
- Necesidad del cliente.

---

## 14. URL de origen

El mensaje de WhatsApp debe indicar claramente desde qué contenido llegó el cliente.

Ejemplo:

```text
Vengo desde:
https://resetenlinea.com/reset/epson/l1250/
```

Nunca utilizar:

- `localhost`.
- URLs temporales.
- Dominios de desarrollo.
- Dominios externos.
- Dominios inventados.

La URL debe construirse usando una configuración central:

```text
SITE_URL = "https://resetenlinea.com"
```

---

## 15. Trazabilidad mediante source_id

Cada CTA debe tener un identificador interno:

```text
source_id
```

Ejemplos:

```text
epson-l1250-hero
epson-l1250-error
epson-l1250-faq
canon-g6010-hero
```

Dos CTA dentro de una misma página pueden tener diferentes `source_id`.

Esto prepara la futura trazabilidad:

```text
Contenido
    ↓
CTA
    ↓
Clic
    ↓
source_id
    ↓
Conversación
    ↓
Diagnóstico
    ↓
Compatibilidad
    ↓
Solución
    ↓
Pago
    ↓
Servicio
    ↓
Garantía
```

En esta primera fase no se implementa el backend completo de analítica.

Solo se prepara la arquitectura.

---

## 16. Configuración central

Crear una configuración central:

```text
src/config/site.ts
```

Debe centralizar como mínimo:

```text
SITE_URL
WHATSAPP_NUMBER
DEFAULT_LOCALE
SUPPORTED_LOCALES
HREFLANG_BY_LOCALE
```

---

## 17. Internacionalización

Estructura propuesta:

```text
src/i18n/
├── locales/
│   ├── es.json
│   ├── en.json
│   ├── pt.json
│   ├── fr.json
│   └── it.json
└── utils.ts
```

Las traducciones deben incluir:

- Textos de interfaz.
- Navegación.
- Botones.
- CTA.
- Mensajes de WhatsApp.

---

## 18. Datos

Los datos se importan desde el proyecto de auditoría solamente en lectura.

Fuentes:

```text
master-data/knowledge-base/dim_marca.csv
master-data/knowledge-base/dim_modelo.csv
```

El nuevo proyecto debe generar sus propios datos:

```text
src/data/marcas.json
src/data/modelos-muestra.json
```

Relación:

```text
Auditoría CSV
     ↓
Script de importación
     ↓
JSON propio del sitio
     ↓
Build Astro
```

El script propuesto:

```text
scripts/import-knowledge-base.mjs
```

El proyecto de auditoría nunca debe recibir escrituras desde el proyecto Astro.

---

## 19. Componentes principales

### Configuración

```text
src/config/site.ts
```

### Layout

```text
src/layouts/BaseLayout.astro
```

Debe centralizar:

- Title.
- Meta description.
- Canonical.
- Hreflang.
- Open Graph.

### Componentes

```text
src/components/
├── WhatsAppCTA.astro
├── LanguageBanner.astro
├── LanguageSelector.astro
├── Breadcrumb.astro
├── Header.astro
└── Footer.astro
```

### Componentes de páginas

```text
src/components/pages/
├── HomePage.astro
├── ModeloPage.astro
├── ComoFuncionaPage.astro
├── PreguntasFrecuentesPage.astro
└── ContactoPage.astro
```

Evitar duplicar la lógica cinco veces por idioma.

Las páginas deben reutilizar componentes y recibir contenido/configuración según el locale.

---

## 20. Estructura inicial propuesta

```text
ResetEnLinea-Site/
│
├── CLAUDE.md
├── README.md
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── .gitignore
│
├── public/
│   └── favicon.svg
│
├── scripts/
│   └── import-knowledge-base.mjs
│
└── src/
    ├── config/
    │   └── site.ts
    │
    ├── i18n/
    │   ├── locales/
    │   │   ├── es.json
    │   │   ├── en.json
    │   │   ├── pt.json
    │   │   ├── fr.json
    │   │   └── it.json
    │   └── utils.ts
    │
    ├── data/
    │   ├── marcas.json
    │   └── modelos-muestra.json
    │
    ├── layouts/
    │   └── BaseLayout.astro
    │
    ├── components/
    │   ├── WhatsAppCTA.astro
    │   ├── LanguageBanner.astro
    │   ├── LanguageSelector.astro
    │   ├── Breadcrumb.astro
    │   ├── Header.astro
    │   ├── Footer.astro
    │   └── pages/
    │       ├── HomePage.astro
    │       ├── ModeloPage.astro
    │       ├── ComoFuncionaPage.astro
    │       ├── PreguntasFrecuentesPage.astro
    │       └── ContactoPage.astro
    │
    └── pages/
        ├── index.astro
        ├── como-funciona.astro
        ├── preguntas-frecuentes.astro
        ├── contacto.astro
        │
        ├── reset/
        │   └── [marca]/
        │       └── [modelo].astro
        │
        └── [locale]/
            ├── index.astro
            ├── como-funciona.astro
            ├── preguntas-frecuentes.astro
            ├── contacto.astro
            └── reset/
                └── [marca]/
                    └── [modelo].astro
```

---

## 21. Primer bloque de desarrollo

No generar todavía todo el catálogo.

Primero validar:

- Arquitectura.
- Rutas.
- Internacionalización.
- SEO técnico.
- WhatsApp contextual.
- Configuración centralizada.
- Reutilización de componentes.

### Páginas iniciales en español

```text
/
/como-funciona/
/preguntas-frecuentes/
/contacto/

/reset/epson/l1250/
/reset/canon/g6010/
/reset/epson-sc/t3170/
/reset/canon/mb5150/
```

Las mismas rutas deben existir para:

```text
/en/
/pt/
/fr/
/it/
```

---

## 22. Lo que NO se implementa todavía

No implementar todavía:

- Aproximadamente 420 páginas completas.
- Backend de analítica.
- CRM.
- Sistema completo de trazabilidad.
- WooCommerce.
- ResetHUB.
- WordPress.
- Redirecciones 301 reales.
- Dominio o hosting de producción.
- Backend de pagos.
- CMS.
- Sistema de tickets.
- Chat complejo.
- Modalidades como páginas públicas.
- Migración definitiva del tráfico.

Primero validar el núcleo del sitio.

---

## 23. Pruebas obligatorias

Después de construir el primer bloque:

### Build

```bash
npm run build
```

Debe finalizar sin errores.

### Rutas

Verificar las rutas en:

```text
ES
EN
PT
FR
IT
```

para al menos una página de modelo.

### SEO

Verificar:

- Canonical correcto.
- Canonical auto-referenciado.
- Cinco `hreflang`.
- `x-default`.
- Title.
- Meta description.
- Open Graph.

### WhatsApp

Confirmar:

1. El número existe en un único punto de configuración.
2. No está duplicado manualmente.
3. El CTA genera correctamente el mensaje.
4. Marca y modelo son correctos.
5. El error aparece solo cuando existe contexto.
6. La modalidad no aparece automáticamente.
7. La URL usa siempre:

```text
https://resetenlinea.com/
```

8. Nunca utiliza `localhost`.

### source_id

Confirmar que dos CTA diferentes de una misma página pueden tener distinto `source_id` sin duplicar el componente.

---

## 24. Migración SEO

La migración todavía no se ejecuta.

Ya existe un mapa de migración basado en aproximadamente 599 URLs actuales.

La futura implementación deberá:

- Aplicar redirecciones aprobadas.
- Consolidar URLs duplicadas.
- Preservar tráfico existente.
- Evitar cadenas de redirección.
- Validar cada destino antes de producción.
- No migrar automáticamente contenido obsoleto.

Existe una copia del sitio anterior en otro dominio como respaldo para revertir si fuera necesario.

No modificar ni eliminar el sitio actual durante esta fase inicial de Astro.

---

## 25. Principio final

La prioridad no es reproducir el sitio anterior.

La prioridad es construir una arquitectura superior que sea:

- Más clara.
- Más rápida.
- Más segura.
- Más escalable.
- Mejor para SEO.
- Adaptable por idioma.
- Fácil de mantener.
- Basada en datos.
- Preparada para automatización futura.
- Orientada a clientes con intención real de resolver su problema.

Antes de escalar el sitio a cientos de páginas, validar:

```text
Datos
↓
URL
↓
Plantilla
↓
Contenido
↓
SEO
↓
Idiomas
↓
CTA
↓
WhatsApp
↓
Trazabilidad
```
