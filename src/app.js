import "dotenv/config";
// Importamos Express (framework del servidor)
import express from "express";
import connectDB from "./db.js";

// Importamos los enrutadores (rutas separadas por responsabilidad)
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import viewsRouter from "./routes/views.routes.js";

// Importamos el middleware de manejo de errores personalizado
import { errorHandler } from "./middlewares/error-handler.js";

import { engine } from "express-handlebars";
import Handlebars from "handlebars";
import http from "http";
import { Server } from "socket.io";
import productManager from "./managers/ProductManager.js";

connectDB();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const manager = productManager;

// Registrar helpers para Handlebars
Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});
Handlebars.registerHelper("multiply", function (a, b) {
  return (a * b).toFixed(2);
});
// Handlebars setup
app.engine(
  "handlebars",
  engine({
    helpers: {
      eq: (a, b) => a === b,
      multiply: (a, b) => (a * b).toFixed(2),
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Definimos el puerto en el que va a escuchar el servidor
const PORT = 8080;

// Middleware para que Express entienda JSON en el body de las peticiones
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static("public"));

// Rutas principales de la API:
// Todo lo que empiece con /api/products va a ser manejado por productsRouter
app.use("/api/products", productsRouter);
// Todo lo que empiece con /api/carts va a ser manejado por cartsRouter
app.use("/api/carts", cartsRouter);
// Router para vistas
app.use("/", viewsRouter);

// Middleware de manejo de errores personalizado. SIEMPRE después de las rutas
app.use(errorHandler);

// Iniciamos el servidor y lo ponemos a escuchar en el puerto indicado
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

io.on("connection", async (socket) => {
  // Paginación inicial (primera página)
  const sendPage = async (page = 1, limit = 10) => {
    const totalDocs = await manager.countProducts();
    const totalPages = Math.ceil(totalDocs / limit) || 1;
    const skip = (page - 1) * limit;
    const products = await manager.getProducts({}, { limit, skip }, {});
    socket.emit("productsPage", { products, page, totalPages });
  };

  // Al conectar, enviar la primera página
  sendPage(1, 10);

  // Evento para pedir una página específica
  socket.on("getProductsPage", async ({ page = 1, limit = 10 }) => {
    await sendPage(page, limit);
  });

  socket.on("addProduct", async (data) => {
    await manager.addProduct(data);
    // Después de agregar, enviar la primera página actualizada a todos
    io.emit("refreshProductsPage");
  });

  socket.on("deleteProduct", async (id) => {
    try {
      await manager.deleteProduct(id);
      io.emit("refreshProductsPage");
    } catch (error) {
      socket.emit("error", {
        message: error.message,
        status: error.status || 500,
      });
    }
  });

  socket.on("updateProduct", async (id) => {
    io.emit("refreshProductsPage");
  });
});

export { io };
