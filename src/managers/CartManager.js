import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

class CartManager {
  async getCarts() {
    return await Cart.find();
  }

  async getCartById(id) {
    let cart;
    try {
      cart = await Cart.findById(id);
    } catch {}
    if (!cart) {
      const error = new Error("Carrito no encontrado");
      error.status = 404;
      throw error;
    }
    return cart;
  }

  async addCart() {
    const cart = new Cart({ products: [] });
    await cart.save();
    return cart;
  }

  async addProductToCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");
    const product = await Product.findById(productId);
    if (!product) throw new Error("Producto no encontrado");
    if (product.stock === 0) {
      const error = new Error(
        "No se puede agregar al carrito: el producto no tiene stock"
      );
      error.status = 400;
      throw error;
    }
    if (product.status === false) {
      const error = new Error(
        "No se puede agregar al carrito: el producto está inactivo"
      );
      error.status = 400;
      throw error;
    }
    const item = cart.products.find((p) => p.product.toString() === productId);
    if (item) {
      if (item.quantity + 1 > product.stock) {
        const error = new Error(
          "No se puede agregar más cantidad: supera el stock disponible"
        );
        error.status = 400;
        throw error;
      }
      item.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }
    await cart.save();
    return cart;
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");
    const itemIndex = cart.products.findIndex(
      (p) => p.product.toString() === productId
    );
    if (itemIndex === -1) {
      const error = new Error("Producto no encontrado en el carrito");
      error.status = 404;
      throw error;
    }
    cart.products[itemIndex].quantity -= 1;
    if (cart.products[itemIndex].quantity <= 0) {
      cart.products.splice(itemIndex, 1);
    }
    await cart.save();
    return cart;
  }
  async getCartWithProducts(id) {
    let cart;
    try {
      cart = await Cart.findById(id).populate("products.product").lean();
    } catch {}
    if (!cart) {
      const error = new Error("Carrito no encontrado");
      error.status = 404;
      throw error;
    }
    return cart;
  }

  async deleteProductFromCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");
    const prod = await Product.findById(productId);
    if (!prod) throw new Error("Producto no encontrado");
    cart.products = cart.products.filter(
      (p) => p.product.toString() !== productId
    );
    await cart.save();
    return cart;
  }

  async updateCartProducts(cartId, productsArray) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");
    cart.products = productsArray.map((p) => ({
      product: p.product,
      quantity: p.quantity,
    }));
    await cart.save();
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");
    const product = await Product.findById(productId);
    if (!product) throw new Error("Producto no encontrado");
    if (quantity > product.stock) {
      const error = new Error(
        "No se puede establecer una cantidad mayor al stock disponible"
      );
      error.status = 400;
      throw error;
    }
    const item = cart.products.find((p) => p.product.toString() === productId);
    if (!item) throw new Error("Producto no encontrado en el carrito");
    item.quantity = quantity;
    await cart.save();
    return cart;
  }

  async clearCart(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");
    cart.products = [];
    await cart.save();
    return cart;
  }
}

export default new CartManager();
