import mongoose from "mongoose";

let productSchema = new mongoose.Schema({
  titulo: String,
  costo: Number,
  precio: Number,
  stock: Number,
  etiquetas: Array,
  image: String
});

const Product = mongoose.model('Product', productSchema);

export default Product;
