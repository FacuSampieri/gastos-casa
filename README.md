# Casa | Finanzas del Hogar 🏠

**Casa** es una aplicación moderna y minimalista diseñada para el seguimiento inteligente de finanzas personales y gastos del hogar. Con un enfoque en la "Vitalidad Financiera", permite a los usuarios gestionar sus ingresos, gastos fijos y variables con una interfaz elegante y reportes comparativos detallados.

## ✨ Características Principales

- **Resumen Financiero:** Dashboard principal con balance mensual, superávit/déficit y progreso de gastos vs. ingresos.
- **Gestión de Gastos:** Registro detallado de transacciones con categorización inteligente.
- **Categorías Personalizables:** Diferenciación entre gastos fijos y variables, con sistema de íconos y colores personalizados.
- **Comparativa Histórica:** Reportes detallados que comparan el rendimiento financiero a través de los meses (3m, 6m, 12m).
- **Diseño Moderno:** Interfaz basada en el sistema de diseño "Vitality", optimizada para dispositivos móviles y escritorio.
- **Modales y Alertas Personalizadas:** Experiencia de usuario fluida con componentes nativos de la aplicación.

## 🛠️ Tecnologías

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/) con fuente Manrope y Material Symbols.
- **Base de Datos:** [Neon PostgreSQL](https://neon.tech/) (Serverless)
- **Componentes:** React 19 con animaciones personalizadas.

## 🚀 Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente:

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/gastos-casa.git
cd gastos-casa
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con tu cadena de conexión de Neon PostgreSQL:
```env
DATABASE_URL=postgresql://usuario:password@host/dbname?sslmode=require
```

### 4. Inicializar la base de datos
Ejecuta el script SQL incluido para crear las tablas necesarias:
```bash
# Puedes usar la consola de Neon o cualquier cliente SQL con:
# schema.sql
```

### 5. Ejecutar en modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## 📁 Estructura del Proyecto

- `/app`: Rutas y páginas de la aplicación (Next.js App Router).
- `/components`: Componentes reutilizables (Sidebar, Modales, Layout).
- `/lib`: Utilidades, tipos de TypeScript y configuración de base de datos.
- `/public`: Activos estáticos.
- `schema.sql`: Definición de la estructura de la base de datos.

---
Desarrollado con ❤️ para una mejor gestión financiera.
