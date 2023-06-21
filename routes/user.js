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
router.get('/productos',(req,res)=>{
    Product.find({})
    .then(productos=>{
    res.render('pages/productos',{productos:productos})
    })
    .catch(error=>{
        //mensaje sobre el error
        res.render('admin/notfound')
    })
    
})
router.get('/producto/:id',(req,res)=>{
    let productoId = {_id:req.params.id}
    Product.findOne(productoId)
    .then(producto=>{
        res.render('pages/producto',{producto:producto})
    })
    .catch(error => {
        res.redirect('pages/productos')
    })
})
export default router