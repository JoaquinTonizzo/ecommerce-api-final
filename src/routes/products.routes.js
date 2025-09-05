import express from 'express';
import productManager from '../managers/ProductManager.js';

const router = express.Router();
const manager = productManager;

// Ruta GET '/' -> Lista todos los productos
router.get('/', async (req, res, next) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort,
      query
    } = req.query;

    let filter = {};
    if (query) {
      if (query === 'true' || query === 'false') {
        filter.status = query === 'true';
      } else {
        filter.category = query;
      }
    }

    let sortOption = {};
    if (sort === 'asc') sortOption.price = 1;
    if (sort === 'desc') sortOption.price = -1;

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);

    // Obtener total de productos para paginación
    const totalDocs = await manager.countProducts(filter);
    const totalPages = Math.ceil(totalDocs / limitNum) || 1;
    const skip = (pageNum - 1) * limitNum;

    const products = await manager.getProducts(filter, { limit: limitNum, skip }, sortOption);

    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;
    const prevPage = hasPrevPage ? pageNum - 1 : null;
    const nextPage = hasNextPage ? pageNum + 1 : null;

    // Construir links
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const queryParams = (params) => {
      return Object.entries({ ...req.query, ...params })
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    };
    const prevLink = hasPrevPage ? `${baseUrl}?${queryParams({ page: prevPage })}` : null;
    const nextLink = hasNextPage ? `${baseUrl}?${queryParams({ page: nextPage })}` : null;

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page: pageNum,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    res.json({ status: 'error', error: error.message });
  }
});

// Ruta GET '/:pid' -> Obtiene un producto por su ID
router.get('/:pid', async (req, res, next) => {
  try {
    const product = await manager.getProductById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Ruta POST '/' -> Crea un nuevo producto
router.post('/', async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'El cuerpo de la solicitud está vacío o no es válido' });
    }

    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || price == null || status == null || stock == null || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const newProduct = await manager.addProduct({ title, description, code, price, status, stock, category, thumbnails });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

// Ruta PUT '/:pid' -> Actualiza un producto existente
import { Server } from 'socket.io';
import http from 'http';
let io;
try {
  // Solo si ya existe el servidor
  io = new Server(http.createServer());
} catch {}

router.put('/:pid', async (req, res, next) => {
  try {
    const updated = await manager.updateProduct(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    // Emitir evento de actualización de productos si existe io
    if (global.io) {
      global.io.emit('products', await manager.getProducts());
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Ruta DELETE '/:pid' -> Elimina un producto por ID
router.delete('/:pid', async (req, res, next) => {
  try {
    const deleted = await manager.deleteProduct(req.params.pid);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

export default router;
