

# Ecommerce API

**Este proyecto es el trabajo final del curso Backend Avanzado Nivel 1 de Coderhouse.** Plataforma de comercio electrónico con administración en tiempo real, filtros avanzados y diseño moderno. 

## Características principales
- Backend en Node.js + Express + MongoDB (Mongoose)
- Vistas con Handlebars y estilos CSS
- Administración de productos en tiempo real (Socket.io)
- Filtros persistentes y paginación backend
- Notificaciones y confirmaciones (Toastify.js, SweetAlert2)
- Manejo robusto de errores y validaciones
- Responsive y accesible

## Instalación
1. Clona el repositorio:
	 ```bash
	 git clone <url-del-repo>
	 cd ecommerce-api-final
	 ```
2. Instala dependencias:
	 ```bash
	 npm install
	 ```
3. Configura tu base de datos MongoDB en `.env`:
	 ```env
	 MONGO_URI=mongodb://localhost:27017/ecommerce
	 PORT=8080
	 ```
4. (Opcional) Carga datos de ejemplo:
	 ```bash
	 node seed.js
	 ```
5. Inicia el servidor:
	 ```bash
	 npm start
	 ```

## Uso
- Accede a `/products` para ver y filtrar productos.
- Accede a `/carts/:cartId` para ver tu carrito.
- Accede a `/realtimeproducts` para administrar productos en tiempo real.

## Endpoints principales
- `GET /api/products` — Listado y filtrado de productos
- `POST /api/products` — Crear producto
- `PUT /api/products/:id` — Editar producto
- `DELETE /api/products/:id` — Eliminar producto
- `GET /api/carts/:cartId` — Ver carrito
- `POST /api/carts/:cartId/product/:productId` — Agregar producto al carrito
- `PUT /api/carts/:cartId/products/:productId` — Actualizar cantidad
- `DELETE /api/carts/:cartId/products/:productId` — Eliminar producto del carrito

## Tecnologías
- Node.js, Express, MongoDB, Mongoose
- Handlebars, CSS, Socket.io
- Toastify.js, SweetAlert2

## Autor
- Desarrollado por Joaquín Gabriel Tonizzo
