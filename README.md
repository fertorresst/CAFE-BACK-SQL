# 🎓 CAFE - Sistema de Gestión de Actividades Culturales

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

**Backend REST API** para el sistema de gestión de actividades culturales y académicas de estudiantes universitarios. Permite a los estudiantes registrar, gestionar y validar actividades de diferentes áreas, mientras que los administradores pueden supervisar, aprobar y generar reportes en PDF.

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura de Base de Datos](#-estructura-de-base-de-datos)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Autenticación y Roles](#-autenticación-y-roles)
- [Áreas de Actividades](#-áreas-de-actividades)
- [Generación de Reportes](#-generación-de-reportes)
- [Sistema de Códigos QR](#-sistema-de-códigos-qr)
- [Manejo de Evidencias](#-manejo-de-evidencias)
- [Scripts Disponibles](#-scripts-disponibles)
- [Variables de Entorno](#-variables-de-entorno)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## ✨ Características Principales

### 👥 **Gestión de Usuarios**
- ✅ Registro y autenticación de estudiantes
- ✅ Perfiles personalizables con foto
- ✅ Soporte para múltiples carreras y sedes (Salamanca y Yuriria)
- ✅ Actualización de datos personales

### 📊 **Gestión de Actividades**
- ✅ Registro de actividades culturales y académicas
- ✅ 5 áreas de actividad: DP/VSS, RS/VCI, CEE/EIE, FCI/ICP, AC
- ✅ Carga de evidencias fotográficas (conversión automática a WebP)
- ✅ Estados de actividades: pendiente, aprobada, rechazada, contactada
- ✅ Observaciones y retroalimentación por parte de administradores

### 🎯 **Gestión de Periodos**
- ✅ Creación de periodos académicos (Enero-Junio, Agosto-Diciembre)
- ✅ Control de fechas de inicio y fin
- ✅ Periodos exclusivos para egresados
- ✅ Estados: activo, pendiente, finalizado

### 🔐 **Sistema de Administración**
- ✅ 4 roles de administrador: superadmin, admin, validador, consulta
- ✅ Validación de actividades
- ✅ Gestión de contactos administrativos
- ✅ Generación automática de reportes en PDF

### 📄 **Generación de Reportes**
- ✅ Reportes generales por periodo
- ✅ Reportes por carrera y sede
- ✅ Generación asíncrona con colas (Bull + Redis)
- ✅ Plantillas personalizables con Handlebars
- ✅ Exportación en PDF con Puppeteer

### 📱 **Códigos QR**
- ✅ Gestión de códigos QR por carrera y área
- ✅ Rutas relativas para fácil integración con frontend
- ✅ Activación/desactivación de códigos QR
- ✅ Solo accesibles por estudiantes de la carrera correspondiente

---

## 🛠️ Tecnologías Utilizadas

### **Backend**
- **Node.js** v18+ - Entorno de ejecución
- **Express.js** - Framework web minimalista y flexible
- **MySQL** - Base de datos relacional

### **Autenticación y Seguridad**
- **JWT (JSON Web Tokens)** - Autenticación basada en tokens
- **bcrypt** - Hash de contraseñas
- **cookie-parser** - Manejo de cookies HTTP

### **Procesamiento de Imágenes**
- **Sharp** - Conversión y optimización de imágenes a WebP
- **Multer** - Middleware para carga de archivos

### **Generación de Reportes**
- **Puppeteer** - Generación de PDFs desde HTML
- **Handlebars** - Motor de plantillas
- **Bull** - Sistema de colas para procesamiento asíncrono
- **Redis** - Backend para Bull (opcional)

### **Utilidades**
- **dotenv** - Gestión de variables de entorno
- **cors** - Control de acceso entre dominios
- **uuid** - Generación de identificadores únicos
- **nodemon** - Auto-reload en desarrollo

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una **arquitectura MVC (Model-View-Controller)** con una clara separación de responsabilidades:

```
CAFE-BACK-SQL/
│
├── src/
│   ├── index.js                    # Punto de entrada principal
│   │
│   ├── auth/                       # Middlewares de autenticación
│   │   ├── adminAuthMiddleware.js  # Auth para administradores
│   │   └── userAuthMiddleware.js   # Auth para estudiantes
│   │
│   ├── config/                     # Configuraciones
│   │   ├── mysql.js                # Conexión a MySQL
│   │   └── queue.js                # Configuración de Bull/Redis
│   │
│   ├── controller/                 # Controladores (lógica de negocio)
│   │   ├── activitiesController.js
│   │   ├── adminController.js
│   │   ├── contactController.js
│   │   ├── evidenceController.js
│   │   ├── periodController.js
│   │   ├── qrCodeController.js
│   │   └── userController.js
│   │
│   ├── interfaces/                 # Interfaces (POO)
│   │   ├── IActivities.js
│   │   ├── IAdmin.js
│   │   ├── ICollectives.js
│   │   ├── IContact.js
│   │   ├── IPeriod.js
│   │   ├── IQRCode.js
│   │   └── IUser.js
│   │
│   ├── middlewares/                # Middlewares personalizados
│   │   └── uploadEvidence.js       # Configuración de Multer
│   │
│   ├── models/                     # Modelos (acceso a datos)
│   │   ├── activitiesModel.js
│   │   ├── adminModel.js
│   │   ├── contactModel.js
│   │   ├── periodModel.js
│   │   ├── qrCodeModel.js
│   │   └── userModel.js
│   │
│   ├── routes/                     # Definición de rutas
│   │   ├── index.js                # Enrutador principal
│   │   ├── activityRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── evidenceRoutes.js
│   │   ├── periodRoutes.js
│   │   ├── qrCodeRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── services/                   # Servicios de negocio
│   │   ├── queueProcessor.js       # Procesador de colas
│   │   └── reportGenerator.js      # Generador de reportes PDF
│   │
│   ├── templates/                  # Plantillas Handlebars
│   │   ├── report-template.hbs     # Plantilla general
│   │   └── report-career-template.hbs # Plantilla por carrera
│   │
│   ├── tools/                      # Herramientas de desarrollo
│   │   └── preview-template.js
│   │
│   └── utils/                      # Utilidades
│       └── imageHelper.js          # Conversión de imágenes
│
├── uploads/                        # Archivos subidos
│   ├── evidence/                   # Evidencias de actividades
│   ├── qr-codes/                   # Códigos QR
│   ├── reports/                    # Reportes PDF generados
│   └── temp/                       # Archivos temporales
│
├── .env                            # Variables de entorno
├── .gitignore                      # Archivos ignorados por Git
├── db.sql                          # Script de creación de BD
├── migration_qr_paths.sql          # Migración de rutas QR
├── modelDB.mwb                     # Modelo de base de datos
├── package.json                    # Dependencias del proyecto
└── README.md                       # Este archivo
```

---

## 🚀 Instalación

### **Requisitos Previos**

- **Node.js** v18.0 o superior ([Descargar](https://nodejs.org/))
- **MySQL** v8.0 o superior ([Descargar](https://dev.mysql.com/downloads/))
- **Redis** (opcional, solo para colas) ([Descargar](https://redis.io/download))
- **Git** ([Descargar](https://git-scm.com/))

### **Paso 1: Clonar el Repositorio**

```bash
git clone https://github.com/fertorresst/CAFE-BACK-SQL.git
cd CAFE-BACK-SQL
```

### **Paso 2: Instalar Dependencias**

```bash
npm install
```

### **Paso 3: Configurar Base de Datos**

1. **Crear la base de datos MySQL:**

```bash
mysql -u root -p < db.sql
```

O desde MySQL Workbench:
- Abrir `db.sql`
- Ejecutar el script completo

2. **(Opcional) Migrar rutas de códigos QR:**

Si ya tienes datos de QR codes con rutas absolutas:

```bash
mysql -u cafe -p cafe < migration_qr_paths.sql
```

### **Paso 4: Configurar Variables de Entorno**

Crear archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos MySQL
DB_HOST=localhost
DB_USER=cafe
DB_PASSWORD=123456
DB_NAME=proyecto_cafe

# JWT Secret (cambiar en producción)
JWT_SECRET=tu_clave_secreta_super_segura_aqui_123456

# Redis (opcional, para colas)
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000
```

### **Paso 5: Iniciar el Servidor**

#### **Modo Desarrollo (con auto-reload):**

```bash
npm run serve
```

#### **Modo Producción:**

```bash
node src/index.js
```

El servidor estará disponible en: **http://localhost:5000**

---

## ⚙️ Configuración

### **Configuración de CORS**

Editar `src/index.js` para cambiar el origen permitido:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
```

### **Configuración de Redis (Colas)**

Si no tienes Redis instalado, las colas no funcionarán. Para instalar Redis:

**Windows:**
```bash
# Usar WSL o Docker
docker run -d -p 6379:6379 redis
```

**Linux/Mac:**
```bash
sudo apt install redis-server  # Ubuntu/Debian
brew install redis             # macOS
```

### **Configuración de Archivos Estáticos**

Las rutas de archivos estáticos están configuradas en `src/index.js`:

```javascript
// Evidencias de actividades
app.use("/evidence", express.static(path.join(__dirname, '../uploads/evidence')))

// Códigos QR
app.use("/qr-codes", express.static(path.join(__dirname, '../uploads/qr-codes')))
```

---

## 🗄️ Estructura de Base de Datos

### **Tablas Principales**

#### **1. admins** - Administradores del Sistema
```sql
- adm_id (PK)
- adm_email (UNIQUE)
- adm_password (hash bcrypt)
- adm_name, adm_last_name, adm_second_last_name
- adm_phone
- adm_role: superadmin | admin | validador | consulta
- adm_active (BOOLEAN)
- adm_profile_picture
- timestamps
```

#### **2. users** - Estudiantes
```sql
- use_id (PK)
- use_nua (UNIQUE) - Número Único de Alumno
- use_name, use_last_name, use_second_last_name
- use_career (ENUM con 12 carreras)
- use_phone
- use_email (UNIQUE @ugto.mx)
- use_password (hash bcrypt)
- use_sede: SALAMANCA | YURIRIA
- use_profile_picture
- timestamps
```

#### **3. periods** - Periodos Académicos
```sql
- per_id (PK)
- per_name (UNIQUE) - Formato: EJAA-01, ADAA-01
- per_date_start, per_date_end
- per_exclusive (BOOLEAN) - Solo para egresados
- per_status: active | pending | ended
- per_create_admin_id (FK → admins)
- per_report_path - Ruta del reporte PDF
- timestamps
```

#### **4. activities** - Actividades Culturales
```sql
- act_id (PK)
- act_name
- act_date_start, act_date_end
- act_hours (INT)
- act_institution
- act_evidence (JSON) - {"fotos": ["/evidence/..."]}
- act_area: DP/VSS | RS/VCI | CEE/EIE | FCI/ICP | AC
- act_status: approval | pending | rejected | contacted
- act_observations (TEXT)
- act_last_admin_id (FK → admins)
- act_user_id (FK → users)
- act_period_id (FK → periods)
- timestamps
```

#### **5. contact** - Contactos Administrativos
```sql
- con_id (PK)
- con_user_id (FK → users)
- con_admin_id (FK → admins)
- con_period_id (FK → periods)
- con_activity_id (FK → activities)
- con_description (TEXT)
- con_observations (TEXT)
- con_status: pending | in_progress | resolved | cancelled
- con_last_admin_id (FK → admins)
- timestamps
```

#### **6. qr_codes** - Códigos QR por Carrera y Área
```sql
- qr_id (PK)
- qr_career (ENUM con 12 carreras)
- qr_area (ENUM: DP/VSS | RS/VCI | CEE/EIE | FCI/ICP | AC)
- qr_image_path - Ruta relativa: /qr-codes/archivo.png
- qr_description
- qr_active (BOOLEAN)
- qr_created_by (FK → admins)
- timestamps
```

### **Relaciones**

```
admins 1───N periods
admins 1───N qr_codes
admins 1───N contact
users 1───N activities
users 1───N contact
periods 1───N activities
periods 1───N contact
activities 1───1 contact (opcional)
```

---

## 🔌 Endpoints de la API

### **Base URL**
```
http://localhost:5000/api
```

### **📋 Usuarios (Estudiantes)**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/users/create-user` | Registrar nuevo estudiante | Público |
| `POST` | `/users/login` | Iniciar sesión | Público |
| `POST` | `/users/logout` | Cerrar sesión | User |
| `GET` | `/users/me` | Obtener datos del usuario autenticado | User |
| `GET` | `/users/profile` | Obtener perfil completo | User |
| `PUT` | `/users/update-profile` | Actualizar perfil | User |
| `GET` | `/users/get-all-users` | Listar todos los usuarios | Admin |
| `GET` | `/users/get-user/:id` | Obtener usuario por ID | User |
| `PUT` | `/users/update-user/:id` | Actualizar datos de usuario | User |
| `PUT` | `/users/update-password-by-user/:id` | Cambiar contraseña | User |
| `PUT` | `/users/update-password-by-admin/:id` | Cambiar contraseña (admin) | Admin |
| `DELETE` | `/users/delete-user/:id` | Eliminar usuario | Admin |
| `GET` | `/users/students-with-activities` | Usuarios con actividades | Admin |

### **🎯 Actividades**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/activities/period/:id` | Actividades de un periodo | Admin |
| `PUT` | `/activities/status/:activityId` | Actualizar estado de actividad | Admin |
| `PUT` | `/activities/:activityId` | Actualizar actividad | Admin |
| `GET` | `/activities/user/:id` | Actividades de un usuario | User |
| `DELETE` | `/activities/:activityId` | Eliminar actividad | User |

### **📸 Evidencias**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/evidence/with-evidence` | Crear actividad con evidencias | User |
| `PUT` | `/evidence/evidence/:activityId` | Actualizar evidencias | User |

### **📅 Periodos**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/periods/get-all-periods` | Listar todos los periodos | Admin |
| `GET` | `/periods/get-period-info/:id` | Obtener info de periodo | Admin |
| `POST` | `/periods/create-period` | Crear nuevo periodo | Admin |
| `DELETE` | `/periods/delete-period/:id` | Eliminar periodo | Admin |
| `PATCH` | `/periods/update-dates` | Actualizar fechas | Admin |
| `PATCH` | `/periods/update-status` | Actualizar estado | Admin |
| `GET` | `/periods/get-all-period-activities/:id` | Actividades del periodo | Admin |
| `GET` | `/periods/get-area-counts/:id` | Conteo por área | Admin |
| `GET` | `/periods/get-period-for-download/:id` | Info para descarga | Admin |
| `GET` | `/periods/final-report/:periodId` | Reporte final | Admin |
| `GET` | `/periods/download-report/:id` | Descargar reporte PDF | Admin |
| `GET` | `/periods/download-career-report` | Reporte por carrera | Admin |
| `GET` | `/periods/get-careers-with-activities/:periodId` | Carreras con actividades | Admin |

### **📱 Códigos QR**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/qr-codes/get-all-qr-codes` | Listar todos los QR codes | Superadmin |
| `POST` | `/qr-codes/create-qr-code` | Crear código QR | Superadmin |
| `PUT` | `/qr-codes/update-qr-code/:id` | Actualizar código QR | Superadmin |
| `DELETE` | `/qr-codes/delete-qr-code/:id` | Eliminar código QR | Superadmin |
| `GET` | `/qr-codes/get-my-qr-codes` | Mis códigos QR (estudiante) | User |
| `GET` | `/qr-codes/get-by-career-area` | QR por carrera y área | User |

### **👥 Administradores**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/admin/get-all-admins` | Listar administradores | Superadmin |
| `POST` | `/admin/create-admin` | Crear administrador | Superadmin |
| `PUT` | `/admin/update-admin/:id` | Actualizar administrador | Superadmin |
| `DELETE` | `/admin/delete-admin/:id` | Eliminar administrador | Superadmin |
| `POST` | `/admin/login` | Login de administrador | Público |
| `POST` | `/admin/logout` | Logout de administrador | Admin |
| `GET` | `/admin/me` | Perfil de admin autenticado | Admin |

### **📞 Contactos**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/contacts/get-all-contacts` | Listar todos los contactos | Admin |
| `POST` | `/contacts/create-contact` | Crear contacto | Admin |
| `PUT` | `/contacts/update-contact/:id` | Actualizar contacto | Admin |
| `DELETE` | `/contacts/delete-contact/:id` | Eliminar contacto | Admin |

---

## 🔐 Autenticación y Roles

### **Sistema de Autenticación**

El sistema utiliza **JWT (JSON Web Tokens)** almacenados en **cookies HTTP-only** para mayor seguridad.

#### **Flujo de Autenticación**

```
1. Usuario/Admin hace login
   ↓
2. Backend valida credenciales
   ↓
3. Se genera JWT con datos mínimos: {id, type, role}
   ↓
4. JWT se almacena en cookie HTTP-only
   ↓
5. Cliente envía cookie en cada request
   ↓
6. Middleware valida JWT
   ↓
7. Request autorizado → Ejecuta acción
```

#### **Estructura del JWT**

**Para Estudiantes:**
```json
{
  "id": 1,
  "isTeacher": false,
  "type": "user",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Para Administradores:**
```json
{
  "id": 1,
  "role": "superadmin",
  "type": "admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### **Roles de Administrador**

| Rol | Permisos |
|-----|----------|
| **superadmin** | ✅ Acceso total al sistema<br>✅ Gestionar administradores<br>✅ Gestionar QR codes<br>✅ Todas las funciones de admin |
| **admin** | ✅ Gestionar periodos<br>✅ Gestionar usuarios<br>✅ Validar actividades<br>✅ Generar reportes<br>❌ Gestionar administradores |
| **validador** | ✅ Validar actividades<br>✅ Gestionar contactos<br>✅ Consultar periodos<br>❌ Crear/eliminar periodos |
| **consulta** | ✅ Consultar actividades<br>✅ Consultar periodos<br>❌ Modificar datos |

### **Middlewares de Autenticación**

#### **userAuthMiddleware**
Valida que el usuario sea un estudiante autenticado.

```javascript
const { userAuthMiddleware } = require('../auth/userAuthMiddleware')

router.get('/profile', userAuthMiddleware, getProfile)
```

#### **adminAuthMiddleware**
Valida que el usuario sea un administrador autenticado.

```javascript
const { adminAuthMiddleware } = require('../auth/adminAuthMiddleware')

router.get('/get-all-periods', adminAuthMiddleware, getAllPeriods)
```

---

## 🎨 Áreas de Actividades

El sistema maneja **5 áreas** de actividades culturales y académicas:

| Código | Nombre Completo | Descripción |
|--------|----------------|-------------|
| **DP/VSS** | Desarrollo Personal / Vida Sana y Segura | Actividades de crecimiento personal, salud física y mental |
| **RS/VCI** | Responsabilidad Social / Vida Cultural e Inclusiva | Actividades de impacto social, cultural y de inclusión |
| **CEE/EIE** | Ciencia, Economía y Emprendimiento / Espíritu de Investigación y Emprendimiento | Proyectos científicos, económicos y empresariales |
| **FCI/ICP** | Formación Ciudadana e Identidad / Identidad Comunitaria y Participación | Actividades cívicas y de identidad comunitaria |
| **AC** | Actividades Complementarias | Otras actividades culturales y académicas |

### **Códigos QR por Área**

Cada carrera tiene **5 códigos QR únicos**, uno por cada área. Los estudiantes pueden:

- Ver los 5 códigos QR de su carrera
- Escanear el QR correspondiente al área de su actividad
- Acceder a información específica del área

---

## 📄 Generación de Reportes

### **Tipos de Reportes**

#### **1. Reporte General de Periodo**
- Incluye todas las actividades aprobadas del periodo
- Agrupa por estudiante
- Muestra estadísticas generales
- Generado automáticamente al finalizar periodo

**Endpoint:**
```
GET /api/periods/download-report/:periodId
```

#### **2. Reporte por Carrera y Sede**
- Filtra actividades por carrera y sede
- Detalle de cada estudiante
- Estadísticas específicas de la carrera
- Generación bajo demanda

**Endpoint:**
```
GET /api/periods/download-career-report?periodId=1&career=IS75LI0502&sede=SALAMANCA
```

### **Proceso de Generación**

```
1. Request de descarga de reporte
   ↓
2. Sistema verifica si existe reporte generado
   ↓
3. Si NO existe:
   - Crea job en cola Bull
   - Retorna 202 "Reporte en generación"
   ↓
4. Worker de cola procesa:
   - Consulta datos de BD
   - Renderiza plantilla Handlebars
   - Genera PDF con Puppeteer
   - Guarda en /uploads/reports/
   - Actualiza ruta en BD
   ↓
5. Request siguiente:
   - Retorna PDF para descarga
```

### **Plantillas**

#### **report-template.hbs**
Plantilla general de periodo con:
- Logo institucional
- Datos del periodo
- Lista de estudiantes
- Actividades agrupadas por área
- Totales de horas

#### **report-career-template.hbs**
Plantilla específica por carrera:
- Datos de la carrera
- Estudiantes filtrados
- Actividades por estudiante
- Gráficas y estadísticas

### **Personalización de Plantillas**

Las plantillas usan **Handlebars**. Ejemplo:

```handlebars
<h1>Reporte - {{period.name}}</h1>
<p>Periodo: {{period.dateStart}} a {{period.dateEnd}}</p>

{{#each students}}
  <div class="student">
    <h2>{{fullName}}</h2>
    <p>NUA: {{nua}}</p>
    <p>Carrera: {{career}}</p>
    
    <ul>
      {{#each activities}}
        <li>{{name}} - {{hours}} horas - {{area}}</li>
      {{/each}}
    </ul>
  </div>
{{/each}}
```

---

## 📱 Sistema de Códigos QR

### **Estructura de QR Codes**

Cada carrera tiene **5 códigos QR** únicos (uno por área):

```
Carrera: IS75LI0502 (Lic. en Sistemas Computacionales)
├── QR para DP/VSS
├── QR para RS/VCI
├── QR para CEE/EIE
├── QR para FCI/ICP
└── QR para AC
```

### **Gestión de QR Codes (Superadmin)**

#### **Crear Código QR**

```bash
POST /api/qr-codes/create-qr-code
Content-Type: multipart/form-data

{
  "career": "IS75LI0502",
  "area": "DP/VSS",
  "description": "Código QR para Desarrollo Personal",
  "qrImage": [archivo imagen]
}
```

#### **Actualizar Código QR**

```bash
PUT /api/qr-codes/update-qr-code/1
Content-Type: multipart/form-data

{
  "description": "Nueva descripción",
  "active": "true",
  "qrImage": [nueva imagen opcional]
}
```

#### **Rutas de Almacenamiento**

- **Directorio físico:** `/uploads/qr-codes/`
- **Formato de nombre:** `{CARRERA}_{AREA}_{UUID}.{ext}`
- **Ejemplo:** `IS75LI0502_DP-VSS_a1b2c3d4.png`
- **Ruta en BD:** `/qr-codes/IS75LI0502_DP-VSS_a1b2c3d4.png`
- **URL accesible:** `http://localhost:5000/qr-codes/IS75LI0502_DP-VSS_a1b2c3d4.png`

### **Acceso para Estudiantes**

#### **Obtener mis QR Codes**

```bash
GET /api/qr-codes/get-my-qr-codes
Cookie: user_token=JWT_TOKEN
```

**Respuesta:**
```json
{
  "success": true,
  "qrCodes": [
    {
      "id": 1,
      "career": "IS75LI0502",
      "area": "DP/VSS",
      "imagePath": "/qr-codes/IS75LI0502_DP-VSS_a1b2c3d4.png",
      "description": "Código QR para Desarrollo Personal",
      "active": true
    }
  ]
}
```

#### **Uso en Frontend**

```javascript
// Obtener QR codes del estudiante
const response = await axios.get('/api/qr-codes/get-my-qr-codes')

// Mostrar imágenes
response.data.qrCodes.forEach(qr => {
  const url = `http://localhost:5000${qr.imagePath}`
  // Usar url en <img> tag
})
```

---

## 🖼️ Manejo de Evidencias

### **Subida de Evidencias**

Las evidencias son imágenes que comprueban la realización de actividades.

#### **Proceso de Carga**

```
1. Usuario sube imágenes (JPG, PNG, JPEG, WEBP)
   ↓
2. Multer guarda en /uploads/temp/
   ↓
3. Sharp convierte a WebP (85% quality)
   ↓
4. Se guarda en /uploads/evidence/
   ↓
5. Se elimina archivo temporal
   ↓
6. Se genera JSON: {"fotos": ["/evidence/file.webp"]}
   ↓
7. Se guarda en BD (campo act_evidence)
```

#### **Endpoint para Crear Actividad con Evidencias**

```bash
POST /api/evidence/with-evidence
Content-Type: multipart/form-data

{
  "name": "Taller de Innovación",
  "dateStart": "2024-02-10",
  "dateEnd": "2024-02-12",
  "hours": 12,
  "institution": "UNACH",
  "area": "DP/VSS",
  "status": "pending",
  "userId": 1,
  "periodId": 1,
  "files": [imagen1.jpg, imagen2.png]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "ACTIVIDAD SUBIDA CON ÉXITO",
  "evidenceLinks": [
    "/evidence/1234567890-abc123.webp",
    "/evidence/1234567891-def456.webp"
  ]
}
```

### **Actualización de Evidencias**

```bash
PUT /api/evidence/evidence/:activityId
Content-Type: multipart/form-data

{
  "name": "Taller Actualizado",
  "dateStart": "2024-02-10",
  "dateEnd": "2024-02-12",
  "hours": 15,
  "institution": "UNACH",
  "area": "DP/VSS",
  "keepEvidence": ["evidencia1.webp", "evidencia2.webp"],
  "files": [nuevaImagen.jpg]
}
```

### **Formato de Almacenamiento**

**En Base de Datos (JSON):**
```json
{
  "fotos": [
    "/evidence/1747795379609-8a11et.webp",
    "/evidence/1747804756857-15ntav.webp"
  ]
}
```

**Acceso desde Frontend:**
```javascript
const imageUrl = `http://localhost:5000${evidencePath}`
```

---

## 🔧 Scripts Disponibles

### **Desarrollo**

```bash
# Iniciar servidor con auto-reload
npm run serve

# Equivalente a:
nodemon ./src/index.js
```

### **Producción**

```bash
# Iniciar servidor
node src/index.js
```

### **Base de Datos**

```bash
# Crear base de datos
mysql -u root -p < db.sql

# Migrar rutas de QR codes (si es necesario)
mysql -u cafe -p cafe < migration_qr_paths.sql
```

### **Testing**

```bash
# Ejecutar tests (configurar primero)
npm test
```

---

## 🔑 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# ====================
# SERVIDOR
# ====================
PORT=5000
NODE_ENV=development

# ====================
# BASE DE DATOS MYSQL
# ====================
DB_HOST=localhost
DB_USER=cafe
DB_PASSWORD=tu_contraseña_segura
DB_NAME=proyecto_cafe

# ====================
# JWT
# ====================
# Generar clave segura con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=tu_clave_secreta_super_segura_de_64_caracteres_minimo

# ====================
# REDIS (Opcional)
# ====================
REDIS_HOST=localhost
REDIS_PORT=6379

# ====================
# FRONTEND
# ====================
FRONTEND_URL=http://localhost:3000

# ====================
# UPLOADS
# ====================
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
```

### **Generar JWT Secret Seguro**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🚀 Despliegue

### **Opción 1: Despliegue en VPS (Ubuntu)**

#### **1. Preparar Servidor**

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js v18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
sudo apt install -y mysql-server

# Instalar Redis
sudo apt install -y redis-server

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

#### **2. Configurar Base de Datos**

```bash
sudo mysql
CREATE DATABASE proyecto_cafe;
CREATE USER 'cafe'@'localhost' IDENTIFIED BY 'contraseña_segura';
GRANT ALL PRIVILEGES ON proyecto_cafe.* TO 'cafe'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importar esquema
mysql -u cafe -p proyecto_cafe < db.sql
```

#### **3. Desplegar Aplicación**

```bash
# Clonar repositorio
git clone https://github.com/fertorresst/CAFE-BACK-SQL.git
cd CAFE-BACK-SQL

# Instalar dependencias
npm install --production

# Configurar variables de entorno
nano .env
# (Editar con valores de producción)

# Iniciar con PM2
pm2 start src/index.js --name cafe-backend
pm2 save
pm2 startup
```

#### **4. Configurar Nginx (Proxy Reverso)**

```bash
sudo apt install -y nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/cafe-api
```

```nginx
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/cafe-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### **5. SSL con Let's Encrypt**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.tudominio.com
```

### **Opción 2: Docker**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: proyecto_cafe
      MYSQL_USER: cafe
      MYSQL_PASSWORD: cafepass
    volumes:
      - mysql_data:/var/lib/mysql
      - ./db.sql:/docker-entrypoint-initdb.d/db.sql
    ports:
      - "3306:3306"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      DB_HOST: mysql
      DB_USER: cafe
      DB_PASSWORD: cafepass
      DB_NAME: proyecto_cafe
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mysql
      - redis
    volumes:
      - ./uploads:/app/uploads

volumes:
  mysql_data:
```

```bash
# Iniciar con Docker Compose
docker-compose up -d
```

---

## 👨‍💻 Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

### **1. Fork del Proyecto**

```bash
# Hacer fork en GitHub
# Luego clonar tu fork
git clone https://github.com/TU_USUARIO/CAFE-BACK-SQL.git
```

### **2. Crear Branch de Feature**

```bash
git checkout -b feature/nueva-funcionalidad
```

### **3. Hacer Commits**

```bash
git add .
git commit -m "feat: agregar nueva funcionalidad X"
```

### **Convención de Commits**

Usar [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formato de código
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Mantenimiento

### **4. Push y Pull Request**

```bash
git push origin feature/nueva-funcionalidad
```

Luego crear Pull Request en GitHub.

---

## 📞 Soporte

### **Reportar Bugs**

Crear un [issue en GitHub](https://github.com/fertorresst/CAFE-BACK-SQL/issues) con:

- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots (si aplica)
- Versión de Node.js y dependencias

### **Solicitar Funcionalidades**

Crear un [issue en GitHub](https://github.com/fertorresst/CAFE-BACK-SQL/issues) con etiqueta `enhancement`.

---

## 📜 Licencia

Este proyecto está bajo la Licencia ISC.

---

## 🙏 Agradecimientos

- **Universidad de Guanajuato** - Institución educativa
- **DICIS Salamanca** - División de Ingenierías
- Todos los estudiantes y administradores que usan el sistema

---

## 📊 Estadísticas del Proyecto

- **Lenguaje:** JavaScript (Node.js)
- **Framework:** Express.js
- **Base de Datos:** MySQL
- **Líneas de Código:** ~15,000
- **Endpoints:** 50+
- **Tablas de BD:** 6
- **Arquitectura:** MVC

---

## 🔄 Changelog

### **v1.0.0** (2025-10-22)
- ✅ Sistema base con autenticación JWT
- ✅ CRUD completo de usuarios, actividades y periodos
- ✅ Generación de reportes PDF
- ✅ Sistema de códigos QR
- ✅ Manejo de evidencias con conversión a WebP
- ✅ Sistema de colas para procesamiento asíncrono
- ✅ 4 roles de administrador
- ✅ Rutas relativas para archivos estáticos

---

## 📚 Recursos Adicionales

### **Documentación**
- [Express.js Docs](https://expressjs.com/)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [JWT.io](https://jwt.io/)
- [Puppeteer Docs](https://pptr.dev/)
- [Sharp Docs](https://sharp.pixelplumbing.com/)

### **Tutoriales**
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [REST API Design](https://restfulapi.net/)

---

<div align="center">

**Desarrollado con ❤️ para la Universidad de Guanajuato**

[![GitHub](https://img.shields.io/badge/GitHub-fertorresst-181717?style=for-the-badge&logo=github)](https://github.com/fertorresst)

</div>
