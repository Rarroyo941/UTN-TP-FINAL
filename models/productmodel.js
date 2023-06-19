import mongoose from "mongoose";

let productScheme= new mongoose.Schema({
    titulo: String,
    costo: Number,
    precio: Number,
    stock: Number,
    etiquetas: Array,
    image: String
})

module.exports=moongose.model('Product', productScheme)