import express from "express";
import session from "express-session";
import passport from "passport";
import bcrypt from 'bcrypt';
import User from '../models/usermodel.js';
import Product from '../models/productmodel.js';

const router = express.Router();

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


//   RUTAS .GET

router.get('/', (req, res) => {
  Product.find({})
    .then(productos => {
      res.render('pages/index', { productos: productos });
    })
    .catch(error => {
      res.render('pages/index');
    });
});

router.get('/login', (req,res)=>{
    res.render('pages/login')
})
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});
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
        res.redirect('/productos');
      });
  });
router.get('/dashboard',isLoggedIn,(req,res)=>{
  res.render('pages/dashboard', { user: req.user });
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
router.post('/dashboard',(req,res)=>{
  res.render('dashboard')
})
router.post('/agregarCarrito', (req, res) => {
  const carrito = req.body.agregar;

  Product.findById(carrito)
    .then(producto => {
      req.session.producto = producto; // Guarda el producto en la sesión
      res.redirect('/productos');
    })
    .catch(error => {
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

      // Hash de la contraseña
      const hashedPassword = bcrypt.hashSync(password, 8);

      // Crear un nuevo objeto de usuario con la contraseña hashada
      const nuevoUsuario = new User({
        nombre,
        email,
        password: hashedPassword
      });

      // Guardar el nuevo usuario en la base de datos
      nuevoUsuario.save()
        .then(() => {
          res.redirect('/login');
        })
        .catch((error) => {
          console.log(error)
        });
    })
    .catch((error) => {
      console.log(error)
    });
});
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

export default router


