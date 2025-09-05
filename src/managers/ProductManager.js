import Product from "../models/Product.js";

class ProductManager {
  async countProducts(filter = {}) {
    return await Product.countDocuments(filter);
  }
  async getProducts(filter = {}, options = {}, sortOption = {}) {
    return await Product.find(filter, null, options).sort(sortOption).lean();
  }

  async getProductById(id) {
    let product;
    try {
      product = await Product.findById(id).lean();
    } catch (err) {
      const error = new Error("Error al buscar el producto");
      error.status = 500;
      throw error;
    }
    if (!product) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }
    return product;
  }

  async addProduct(data) {
    const product = new Product(data);
    await product.save();
    return product;
  }

  async updateProduct(id, updates) {
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }
    return product;
  }

  async deleteProduct(id) {
    const result = await Product.findByIdAndDelete(id);
    if (!result) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }
    return true;
  }
}

export default new ProductManager();
