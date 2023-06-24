import express from "express";
const router=express.Router()

import passport from "passport";
import crypto from 'crypto';
//import async from 'async';
//import nodemailer from 'nodemailer'
//import User from '../models/usermodel.js'
import Product from '../models/productmodel.js'
router.get('/', (req,res)=>{
  res.render('pages/index')
})
router.get('/login', (req,res)=>{
    res.render('pages/login')
})
router.get('/olvide', (req,res)=>{
    res.render('pages/olvide')
})
router.get('/registro', (req,res)=>{
    res.render('pages/registro')
})
router.get('/contacto', (req,res)=>{
    res.render('pages/contacto')
})
router.get('/nosotros', (req,res)=>{
    res.render('pages/nosotros')
})
router.get('/envios', (req,res)=>{
    res.render('pages/delivery')
})
router.get('/pagos', (req,res)=>{
    res.render('pages/mediosPago')
})
router.get('/productos', (req, res) => {
    const buscar = req.query.buscar || '';
  
    const regex = buscar !== '' ? new RegExp(`${buscar}`, 'i') : /.*/;
  
    Product.find({ etiquetas: { $regex: regex } })
      .then(productos => {
        if (productos.length > 0) {
          res.render('pages/productos', { productos: productos });
        } else {
          res.render('admin/productNotFound', {buscar:buscar});
        }
      })
      .catch(error => {
        console.error(error);
        res.render('admin/productNotFound', {buscar:buscar});
      });
  });
  
router.get('/producto/:id', (req, res) => {
    let productoId = req.params.id;
    Product.findById(productoId)
      .then(producto => {
        res.locals.randomNumber = Math.floor(Math.random() * 10);
        res.render('pages/producto', { producto: producto });
      })
      .catch(error => {
        console.error(error);
        res.redirect('/productos');
      });
  });
  
  
export default router