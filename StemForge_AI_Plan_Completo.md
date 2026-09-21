# StemForge AI — Plan Completo de Aplicación

**Versión:** 1.0  
**Fecha:** 14 de septiembre de 2026  
**Estado:** Documento de planificación técnica y de producto  

---

## 1. Visión del Producto

**StemForge AI** es una plataforma profesional y accesible de **separación de audio inteligente**, análisis musical y gestión de metadatos.

El usuario sube una canción (o pega un enlace cuando sea legalmente posible) y obtiene:

- Separación de alta calidad de **voz vs instrumental**
- Separación multi-stem completa de **todos los instrumentos** de inicio a fin
- Detección precisa de **BPM, tonalidad, compás y estructura** de la canción
- Lectura, visualización y edición de **metadatos**
- Herramientas de post-procesado, mezcla ligera y exportación profesional lista para DAWs

### Público objetivo

- Productores y beatmakers que necesitan stems limpios para remixes o sampling
- DJs que quieren versiones instrumentales o acapellas de calidad
- Músicos que practican (separar batería + bajo para tocar encima)
- Creadores de contenido (TikTok, YouTube, podcasts)
- Estudiantes de música y escuelas
- Estudios pequeños que no tienen acceso a multitracks originales

### Diferenciadores clave

- Separación **completa y consistente de principio a fin**
- Análisis musical profundo (BPM + estructura + tonalidad) integrado en el mismo flujo
- Metadatos legibles y editables de forma profesional
- Calidad de stems comparable a herramientas pro (Demucs, UVR, BS-RoFormer) con interfaz amigable
- Exportación lista para producción + herramientas de mezcla ligeras

---

## 2. Funcionalidades Detalladas

### 2.1 Separación de Audio (núcleo de la app)

| Modo | Stems generados | Modelo recomendado | Uso principal |
|------|-----------------|--------------------|---------------|
| **Básico** | Vocals + Instrumental | BS-RoFormer o MDX-Net | Karaoke, acapellas |
| **Estándar (4 stems)** | Vocals, Drums, Bass, Other | htdemucs_ft | Remixes, producción general |
| **Avanzado (6 stems)** | + Guitar, Piano | htdemucs_6s | Trabajo más detallado |
| **Studio** | Máxima calidad (ensemble posible) | BS-RoFormer + htdemucs_ft | Entrega profesional |

**Opciones adicionales:**
- Control de agresividad de separación
- Visualización de forma de onda + espectro por stem
- Re-separación de secciones específicas (verso, coro, puente)
- Modos de calidad: Fast / Balanced / Studio

### 2.2 Análisis Musical Automático

- **BPM** preciso (con decimales y nivel de confianza)
- Detección de **tonalidad** (nota raíz + mayor/menor)
- **Compás** (4/4, 3/4, 6/8, etc.)
- **Estructura** de la canción: intro, verso, pre-coro, coro, puente, breakdown, outro (con marcadores editables)
- Detección de cambios de tempo
- Análisis de energía, loudness (LUFS) y rango dinámico

### 2.3 Metadatos

- Lectura completa de tags existentes (título, artista, álbum, año, género, ISRC, copyright, carátula, etc.)
- Visualización clara y editable
- Limpieza y corrección de metadatos
- Incrustación de metadatos correctos + información de la separación en los stems exportados
- Generación de informe de análisis (PDF o texto)

### 2.4 Post-procesado y Exportación

- Mezclador de stems (volumen, mute/solo, pan)
- EQ básico y filtros por stem
- Time-stretch y pitch-shift independientes por stem
- Exportación individual o pack ZIP organizado
- Formatos: WAV 24/32-bit, FLAC, MP3, AIFF
- Presets de exportación para Ableton, Logic Pro, FL Studio, BandLab
- Función “Karaoke Ready”

### 2.5 Experiencia de Usuario

- Interfaz tipo DAW ligero (timeline + lista de stems)
- Procesamiento en la nube + opción offline (fase posterior)
- Historial de proyectos con versiones
- Comparación A/B
- Presets de uso: Karaoke, Remix, Practice, Acapella, Sample Pack
- Detección de problemas (clipping, fase, ruido residual) con sugerencias

---

## 3. Arquitectura y Patrón de Diseño

### 3.1 Patrón principal

**Arquitectura asíncrona basada en Jobs + Clean/Hexagonal Architecture**

Razones:
- La separación de audio es una tarea **CPU/GPU intensiva** (20 s – varios minutos).
- No se puede ejecutar de forma síncrona en un request HTTP.
- Se necesita escalabilidad horizontal de workers GPU.

### 3.2 Diagrama de alto nivel

```
┌─────────────────────┐
│  Frontend (Next.js) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  API Gateway        │  ← FastAPI (Auth, validación, rate limiting)
│  (FastAPI)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Cola de Tareas     │  ← Redis + Celery (o Temporal)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Workers GPU        │  ← Modelos de separación + análisis
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌──────────────────┐
│  Object Storage     │     │  PostgreSQL      │
│  (R2 / S3)          │     │  (usuarios,      │
│                     │     │   proyectos,     │
│                     │     │   jobs, stems)   │
└─────────────────────┘     └──────────────────┘
```

### 3.3 Patrones específicos aplicados

- **Job Queue Pattern** → todo el procesamiento pesado
- **Pipeline Pattern** → dentro del worker (decode → analyze → separate → post-process → export)
- **Repository + Service Layer** (Clean Architecture)
- **Event-driven** → progreso en tiempo real vía WebSocket / SSE
- Separación clara entre dominio (audio processing) e infraestructura

---

## 4. Stack Tecnológico Recomendado (2026)

### 4.1 Frontend

| Tecnología | Uso | Justificación |
|------------|-----|---------------|
| **Next.js 15 (App Router) + React 19** | Framework principal | SSR/SSG, excelente DX |
| **TypeScript** | Tipado estático | Obligatorio |
| **Tailwind CSS + shadcn/ui** | Sistema de diseño | Rápido, moderno y consistente |
| **wavesurfer.js** (o waves-cn) | Waveform interactivo | Estándar de facto, plugins de regions, minimap, spectrogram |
| **Zustand o Jotai** | Estado global | Ligero y simple |
| **TanStack Query** | Data fetching y cache | Ideal para estados de jobs |

### 4.2 Backend

| Tecnología | Uso | Justificación |
|------------|-----|---------------|
| **Python 3.12+** | Lenguaje principal | Mejor ecosistema ML de audio |
| **FastAPI** | API REST + WebSockets | Alta performance, tipado nativo |
| **Celery + Redis** | Cola de tareas | Maduro y simple (alternativa: Temporal) |
| **Pydantic v2** | Validación de datos | Nativo de FastAPI |
| **SQLAlchemy 2 + Alembic** | ORM y migraciones | PostgreSQL |

### 4.3 Machine Learning y Procesamiento de Audio

| Tecnología | Uso | Justificación |
|------------|-----|---------------|
| **python-audio-separator** | Motor principal de separación | Soporta Demucs, MDX-Net, BS-RoFormer, Mel-RoFormer, VR |
| **htdemucs_ft (HTDemucs)** | Modelo por defecto 4/6 stems | Mejor balance calidad/velocidad open-source |
| **BS-RoFormer** | Modo Studio / máxima calidad | De los más altos SDR en vocals e instrumentals (2026) |
| **librosa** | BPM, beat tracking, key, chroma | Estándar de la industria |
| **essentia** (opcional) | Análisis avanzado + estructura | Muy potente para Music Information Retrieval |
| **mutagen** | Lectura/escritura de metadatos | Soporte más amplio de formatos |
| **soundfile / pydub / ffmpeg-python** | I/O de audio | Lectura y escritura robusta |

### 4.4 Infraestructura

| Componente | Recomendación |
|------------|---------------|
| **Object Storage** | Cloudflare R2 o AWS S3 |
| **Base de datos** | PostgreSQL |
| **Cache / Broker** | Redis |
| **GPU Workers** | RunPod, Modal, Vast.ai o AWS g5/L4 |
| **Contenedores** | Docker + Docker Compose (dev) → Kubernetes o Railway + workers separados (prod) |
| **Auth** | Clerk o Auth0 (rápido de implementar) |
| **Observabilidad** | Sentry + Prometheus + Grafana + Flower (Celery) |

### 4.5 Opción Offline / Desktop (Fase 2)

- **Tauri 2** o **Electron**
- Modelos ONNX (`demucs-onnx`) o MLX (Apple Silicon) para procesamiento 100 % local

---

## 5. Pipeline de Procesamiento Detallado

1. **Upload**  
   El frontend sube el archivo directamente a R2/S3 mediante URL prefirmada.

2. **Creación de Job**  
   La API registra el job en PostgreSQL y lo encola en Redis/Celery.

3. **Worker recibe la tarea**:
   - Descarga el audio original
   - Extrae metadatos con `mutagen`
   - Realiza análisis musical con `librosa` (+ `essentia` opcional): BPM, key, structure
   - Ejecuta la separación según el modo elegido:
     - Fast → htdemucs
     - Balanced → htdemucs_ft
     - Studio → BS-RoFormer (o ensemble)
   - Aplica normalización y post-procesado ligero
   - Genera waveforms (opcional)
   - Sube los stems al object storage
   - Actualiza el estado del job y los metadatos enriquecidos

4. **Frontend**  
   Recibe el progreso en tiempo real vía WebSocket o SSE y muestra los resultados.

---

## 6. Modelo de Datos (Simplificado)

```text
User
├── id
├── email
├── plan (free / pro / studio)
└── ...

Project
├── id
├── user_id
├── name
├── original_file_url
├── status
├── created_at
└── ...

Job
├── id
├── project_id
├── type (separate / analyze / ...)
├── model_used
├── progress (0-100)
├── status
├── error_message
└── ...

Stem
├── id
├── job_id
├── type (vocals / drums / bass / other / guitar / piano / instrumental)
├── file_url
├── duration
├── loudness_lufs
└── ...

Analysis
├── id
├── project_id
├── bpm
├── key
├── mode
├── time_signature
├── structure_json
├── confidence
└── ...

Metadata
├── id
├── project_id
├── raw_tags (JSON)
├── editable_fields
└── ...
```

---

## 7. Fases de Desarrollo

### Fase 0 — Investigación y PoC (2-3 semanas)
- Probar `python-audio-separator` + htdemucs_ft + BS-RoFormer
- Benchmark de calidad y tiempo en diferentes GPUs
- Prototipo mínimo de FastAPI + Celery + un worker

### Fase 1 — MVP (8-12 semanas)
- Autenticación + upload + sistema de jobs
- Separación 2 stems + 4 stems
- BPM + Key básicos
- Waveform interactivo + descarga de stems
- Plan gratuito limitado + plan Pro

### Fase 2 — V1 Completa
- 6 stems, estructura de canción, editor de metadatos
- Mezclador simple de stems
- Export packs listos para Ableton / Logic / FL Studio
- Mejoras de UX y rendimiento

### Fase 3 — Escala y Extras
- API pública para desarrolladores
- Aplicación de escritorio offline
- Colaboración entre usuarios
- Generación de MIDI aproximado
- Fine-tunes propios o modelos más avanzados

---

## 8. Consideraciones de Coste, Escalabilidad y Legal

### Costes principales
- **GPU**: El mayor gasto operativo. Usar instancias spot + auto-scaling a cero cuando no hay jobs.
- Modal o RunPod suelen ser más económicos al inicio que AWS on-demand.

### Optimizaciones
- Caché por hash del audio: si ya se procesó, devolver resultados existentes.
- Límites por plan (duración máxima de canción, número de separaciones/mes).
- Rate limiting estricto.

### Aspectos legales
- No almacenar permanentemente canciones de usuarios sin consentimiento claro.
- Política de privacidad estricta.
- No ofrecer descarga automática de YouTube/Spotify sin las licencias correspondientes.
- Informar claramente sobre el uso de modelos open-source y sus licencias.

---

## 9. Estructura de Carpetas Recomendada (Monorepo)

```text
stemforge-ai/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # FastAPI backend
├── packages/
│   ├── shared/              # Tipos compartidos, constantes
│   └── ui/                  # Componentes UI reutilizables
├── workers/
│   ├── separator/           # Worker de separación
│   └── analyzer/            # Worker de análisis musical
├── infrastructure/
│   ├── docker/
│   ├── terraform/           # o pulumi
│   └── k8s/
├── docs/
│   └── PLAN.md              # Este documento
├── scripts/
└── README.md
```

---

## 10. Modelo de Negocio Sugerido

| Plan | Precio orientativo | Límites principales |
|------|--------------------|---------------------|
| **Free** | $0 | 3-5 separaciones/mes, calidad media, solo 2 stems |
| **Pro** | $9–15 / mes | Stems completos, calidad Studio, exportaciones ilimitadas |
| **Studio / Teams** | $29–49 / mes | Procesamiento prioritario, API, colaboración, más minutos |
| **Créditos** | Pay-as-you-go | Para usuarios ocasionales |

---

## 11. Stack Final — Resumen Ejecutivo

| Capa | Tecnología elegida |
|------|--------------------|
| Frontend | Next.js 15 + TypeScript + Tailwind + wavesurfer.js |
| Backend | FastAPI + Celery + Redis + PostgreSQL |
| Separación | python-audio-separator (htdemucs_ft + BS-RoFormer) |
| Análisis | librosa (+ essentia opcional) |
| Metadatos | mutagen |
| Storage | Cloudflare R2 |
| GPU | RunPod / Modal / AWS |
| Auth | Clerk |
| Deploy | Docker + Railway/Fly.io (API) + workers GPU independientes |

---

## 12. Próximos Pasos Inmediatos

1. Crear el repositorio y la estructura de monorepo.
2. Implementar un PoC de separación con `python-audio-separator` y medir tiempos/calidad reales.
3. Definir los contratos de la API (OpenAPI / Swagger).
4. Diseñar el flujo de usuario completo (Figma o similar).
5. Decidir si se arranca solo con versión web o se planifica también la versión desktop offline desde el inicio.

---

## 13. Referencias Técnicas Principales (2025-2026)

- **HTDemucs / htdemucs_ft** — Meta AI (Hybrid Transformer Demucs)
- **BS-RoFormer** — Modelos de alta fidelidad (Viperx y community fine-tunes)
- **python-audio-separator** — Librería unificada para todos los modelos UVR/Demucs/RoFormer
- **librosa** — Análisis de BPM, key y features musicales
- **mutagen** — Gestión de metadatos de audio
- **wavesurfer.js** — Visualización de waveforms en el navegador

---

**Documento generado para StemForge AI**  
Listo para usar como base de planificación, presentación a inversores o guía de desarrollo.
