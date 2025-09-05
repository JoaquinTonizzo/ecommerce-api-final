import { Router } from 'express';
import productManager from '../managers/ProductManager.js';
import cartManager from '../managers/CartManager.js';

const router = Router();
const manager = productManager;

// Ruta para /cart: redirige al carrito del usuario (usando localStorage en el frontend)
router.get('/cart', (req, res) => {
  res.render('cartRedirect');
});

router.get('/', async (req, res) => {
  // Obtener algunos productos para mostrar en el home (opcional: los primeros 4)
  const products = await manager.getProducts({}, { limit: 4 }, {});
  res.render('home', { products });
});

// Vista paginada de productos
router.get('/products', async (req, res) => {
  const {
    limit = 10,
    page = 1,
    sort,
    category,
    status
  } = req.query;
  let filter = {};
  if (category) filter.category = category;
  if (status === 'true' || status === 'false') filter.status = status === 'true';
  let sortOption = {};
  if (sort === 'asc') sortOption.price = 1;
  if (sort === 'desc') sortOption.price = -1;
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const totalDocs = await manager.countProducts(filter);
  const totalPages = Math.ceil(totalDocs / limitNum) || 1;
  const skip = (pageNum - 1) * limitNum;
  const products = await manager.getProducts(filter, { limit: limitNum, skip }, sortOption);
  // Obtener todas las categorías únicas
  const allProducts = await manager.getProducts({}, {}, {});
  const categories = [...new Set(allProducts.map(p => p.category))].sort();
  const hasPrevPage = pageNum > 1;
  const hasNextPage = pageNum < totalPages;
  const prevPage = hasPrevPage ? pageNum - 1 : null;
  const nextPage = hasNextPage ? pageNum + 1 : null;
  const baseUrl = `/products`;
  const queryParams = (params) => {
    return Object.entries({ ...req.query, ...params })
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
  };
  const prevLink = hasPrevPage ? `${baseUrl}?${queryParams({ page: prevPage })}` : null;
  const nextLink = hasNextPage ? `${baseUrl}?${queryParams({ page: nextPage })}` : null;
  // Determinar valores para los filtros
  let queryCategory = category || '';
  let queryStatus = status || '';
  res.render('products', {
    products,
    totalPages,
    prevPage,
    nextPage,
    page: pageNum,
    hasPrevPage,
    hasNextPage,
    prevLink,
    nextLink,
    queryCategory,
    queryStatus,
    sort,
    limit,
    categories
  });
});

// Vista detalle de producto
router.get('/products/:pid', async (req, res) => {
  const product = await manager.getProductById(req.params.pid);
  res.render('productDetail', { product });
});

// Vista de carrito
router.get('/carts/:cid', async (req, res) => {
  const cart = await cartManager.getCartWithProducts(req.params.cid);
  res.render('cart', { products: cart.products });
});

router.get('/realtimeproducts', async (req, res) => {
  const products = await manager.getProducts();
  res.render('realTimeProducts', { products });
});

export default router;
