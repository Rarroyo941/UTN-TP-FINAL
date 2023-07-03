import express from "express";
const router=express.Router()
import session from "express-session";
import passport from "passport";
import crypto from 'crypto';
//import async from 'async';
//import nodemailer from 'nodemailer'
import User from '../models/usermodel.js'
import Product from '../models/productmodel.js'


//   RUTAS .GET

router.get('/', (req, res) => {
  Product.find({})
    .then(productos => {
      res.render('pages/index', { productos: productos });
    })
    .catch(error => {
      //mensaje sobre el error
      res.render('pages/index');
    });
});

router.get('/login', (req,res)=>{
    res.render('pages/login')
})
router.get('/logout',(req,res)=>{
  req.logOut()
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
router.get('/dashboard',(req,res)=>{
  res.render('pages/dashboard')
})
router.get('/dashboard/usuarios', (req,res)=>{
    res.render('admin/allusers')
})
router.get('/dashboard/usuarios/editar', (req,res)=>{
  res.render('admin/edituser')
})
router.use(session({
  secret: 'secreto', // Cambia esto por una clave secreta segura
  resave: false,
  saveUninitialized: true
}));
router.get('/carrito', (req, res) => {
  const producto = req.session.producto; // Obtén el producto de la sesión
  res.render('pages/carrito', { producto: producto });
});



//  RUTAS .POST
router.post('/agregarCarrito', (req, res) => {
  const carrito = req.body.agregar;

  Product.findById(carrito)
    .then(producto => {
      req.session.producto = producto; // Guarda el producto en la sesión
      res.redirect('/productos');
    })
    .catch(error => {
      console.error(error);
      res.redirect('/carrito');
    });
});

router.post('/registro', (req, res) => {
  const { nombre, email, password } = req.body;

  // Validación básica de campos
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Por favor, complete todos los campos' });
  }

  // Verificar si el email ya está registrado
  User.findOne({ email })
    .then(usuarioExistente => {
      if (usuarioExistente) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Crear un nuevo objeto de usuario
      const nuevoUsuario = new User({
        nombre,
        email,
        password
      });

      // Guardar el nuevo usuario en la base de datos
      nuevoUsuario.save()
        .then(() => {
          res.redirect('/login')
        })
        .catch((error) => {
          res.status(400).json({ error: error.message });
        });
    })
    .catch((error) => {
      res.status(400).json({ error: error.message });
    });
});
router.post('/login',passport.authenticate('local',{
  successRedirect:'/dashboard'
}),(req,res)=>{

})

export default router


