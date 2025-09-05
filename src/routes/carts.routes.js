import express from 'express';
import cartManager from '../managers/CartManager.js';

const router = express.Router();
const manager = cartManager;

// POST /api/carts/ => Crear nuevo carrito
router.post('/', async (req, res, next) => {
  try {
    const newCart = await manager.addCart();
    res.status(201).json(newCart);
  } catch (error) {
    next(error);
  }
});

// GET /api/carts/:cid => Obtener productos del carrito (populate)
router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await manager.getCartWithProducts(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/carts/:cid/products/:pid => Eliminar producto específico del carrito (una unidad)
router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const cart = await manager.deleteProductFromCart(req.params.cid, req.params.pid);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

// PUT /api/carts/:cid => Actualizar todos los productos del carrito con un arreglo
router.put('/:cid', async (req, res, next) => {
  try {
    const cart = await manager.updateCartProducts(req.params.cid, req.body.products);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

// PUT /api/carts/:cid/products/:pid => Actualizar cantidad de un producto específico
router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await manager.updateProductQuantity(req.params.cid, req.params.pid, quantity);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/carts/:cid => Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res, next) => {
  try {
    const cart = await manager.clearCart(req.params.cid);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

// POST /api/carts/:cid/product/:pid => Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const updatedCart = await manager.addProductToCart(req.params.cid, req.params.pid);
    if (!updatedCart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(updatedCart);
  } catch (error) {
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/carts/:cid/product/:pid => Quitar producto del carrito (todas sus unidades)
router.delete('/:cid/product/:pid', async (req, res, next) => {
  try {
    const updatedCart = await manager.removeProductFromCart(req.params.cid, req.params.pid);
    res.json(updatedCart);
  } catch (error) {
    if (error.message === 'Carrito no encontrado' || error.message === 'Producto no encontrado en el carrito') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

export default router;
