# ViPallá - App de Reparto a Domicilio

Aplicación completa para empresa de reparto a domicilio que permite:
- Conectar con WhatsApp para pedidos
- Recepción de pedidos de cualquier establecimiento
- Pago por Bizum, tarjeta o efectivo

## 📁 Estructura del Proyecto

```
vipalla_app/
├── backend/                 # API en Python (FastAPI)
│   ├── server.py           # Código principal del servidor
│   ├── requirements.txt    # Dependencias Python
│   └── .env               # Variables de entorno
│
├── frontend/               # App móvil (React Native/Expo)
│   ├── app/               # Pantallas de la aplicación
│   │   ├── (tabs)/        # Pestañas del cliente
│   │   ├── admin/         # Panel de administración
│   │   ├── driver/        # Panel del repartidor
│   │   └── order/         # Formulario de pedido
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── services/      # Llamadas a la API
│   │   ├── store/         # Estado global (Zustand)
│   │   └── types/         # Tipos TypeScript
│   ├── package.json       # Dependencias Node.js
│   └── app.json          # Configuración Expo
│
└── README.md
```

## 🚀 Instalación

### Backend (Python 3)

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env
# Edita el archivo .env con tu URL de MongoDB

# Ejecutar servidor
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend (React Native/Expo)

```bash
cd frontend

# Instalar dependencias
npm install
# o
yarn install

# Ejecutar en modo desarrollo
npx expo start
```

## 🔧 Configuración

### Backend (.env)
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="vipalla_db"
```

### Frontend (.env)
```
EXPO_PUBLIC_BACKEND_URL=http://tu-servidor:8001
```

## 📱 Funcionalidades

### Cliente
- Ver lista de tiendas con búsqueda y filtros
- Crear pedidos con múltiples productos
- Integración con WhatsApp para confirmar pedidos
- Seguimiento de pedidos por ID
- Ver información de métodos de pago

### Repartidor
- Registro como repartidor
- Ver pedidos disponibles
- Aceptar pedidos
- Actualizar estado del pedido (Recogiendo → En camino → Entregado)

### Administración
- Dashboard con estadísticas
- Gestionar tiendas (CRUD)
- Gestionar repartidores (CRUD)
- Ver todos los pedidos con filtros

## 🔌 API Endpoints

### Tiendas
- `GET /api/stores` - Listar tiendas
- `POST /api/stores` - Crear tienda
- `PUT /api/stores/{id}` - Actualizar tienda
- `DELETE /api/stores/{id}` - Eliminar tienda

### Pedidos
- `GET /api/orders` - Listar pedidos
- `GET /api/orders/pending` - Pedidos pendientes
- `POST /api/orders` - Crear pedido
- `POST /api/orders/{id}/accept` - Aceptar pedido
- `POST /api/orders/{id}/status` - Actualizar estado

### Repartidores
- `GET /api/drivers` - Listar repartidores
- `POST /api/drivers` - Crear repartidor
- `PUT /api/drivers/{id}` - Actualizar repartidor

### Otros
- `GET /api/stats` - Estadísticas
- `GET /api/payment-info` - Info de pago

## 💳 Métodos de Pago

- **Bizum**: Número configurado en PaymentInfo
- **Tarjeta**: Contacto para coordinar pago
- **Efectivo**: Pago al repartidor

## 📞 Integración WhatsApp

La app genera un mensaje pre-escrito con los detalles del pedido y abre WhatsApp para enviarlo al número configurado.

## 🛠️ Tecnologías

- **Backend**: Python 3, FastAPI, MongoDB, Motor (async)
- **Frontend**: React Native, Expo, TypeScript, Zustand
- **Base de datos**: MongoDB

## 📄 Licencia

Este proyecto es privado para uso de ViPallá.
