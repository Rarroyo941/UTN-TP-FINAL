import express from "express";
import session from "express-session";
import passport from "passport";
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import Product from '../models/productmodel.js';
import crypto from 'crypto';
import async from 'async';
import nodemailer from 'nodemailer';
import LocalStrategy from 'passport-local';

const router = express.Router();
const initializeCarrito = (req, res, next) => {
  if (!req.session.carrito) {
    req.session.carrito = [];
  }
  next();
};
function isAuthenticatedUser(req, res, next) {
  if(req.isAuthenticated()) {
      return next();
  }
  req.flash('error_msg', 'Por favor ingrese sesión.')
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

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('dashboard'); // Renderiza la página del dashboard si el usuario está autenticado
  } else {
    res.render('pages/login'); // Renderiza la página de login si el usuario no está autenticado
  }
});
router.get('/logout', isAuthenticatedUser, (req, res) => {
  req.logout();
  req.flash('success_msg', 'Ha cerrado sesión.');
  res.redirect('/login');
});
router.get('/olvide', (req,res)=>{
    res.render('pages/olvide')
})
router.get('/registro', (req,res)=>{
    res.render('pages/registro')
})
router.get('/reset/:token', (req, res)=> {
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires : {$gt : Date.now() } })
      .then(user => {
          if(!user) {
              req.flash('error_msg', 'Password reset token in invalid or has been expired.');
              res.redirect('/olvide');
          }

          res.render('pages/newpassword', {token : req.params.token});
      })
      .catch(err => {
          req.flash('error_msg', 'ERROR: '+err);
          res.redirect('/olvide');
      });
});
router.get('/password/change', isAuthenticatedUser, (req, res)=> {
  res.render('pages/changepassword');
});
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
router.get('/dashboard',isAuthenticatedUser,(req,res)=>{
  res.render('pages/dashboard', { user: req.user });
})
router.get('/carrito',initializeCarrito, async (req, res) => {
  try {
    const productos = await Product.find({ _id: { $in: req.session.carrito } });
    let total = 0;
    for (const producto of productos) {
      total += producto.precio;
    }
    let cantidad = 1;
    res.render('pages/carrito', { productos,total,cantidad }); // Renderiza la vista 'carrito.ejs' con los productos del carrito
  } catch (error) {
    console.error('Error al obtener los productos del carrito:', error);
    res.redirect('/'); // Redirige a la página principal o de error
  }
});

/*router.get('/*', (req,res)=>{
  res.render('admin/pageNotFound')
})*/

//  RUTAS .POST
router.post('/dashboardUsuario',(req,res)=>{
  res.render('dashboard')
})

router.post('/registro', (req, res)=> {
    User.findOne({email:req.body.email}).then((user)=>{
      if(user) {
          req.flash('error_msg', 'El email ya se encuentra registrado');
          res.redirect('/registro')
      } else {
          let {nombre, email, password} = req.body;
          const newUser = new User({
              nombre: nombre,
              email: email
          });
          
          // Generar el hash de la contraseña
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) {
                req.flash('error_msg', 'ERROR: ' + err);
                res.redirect('/registro');
              }
              
              // Asignar la contraseña encriptada al nuevo usuario
              newUser.password = hash;
              
              // Guardar el usuario en la base de datos
              User.register(newUser, password, (err, user)=> {
                if(err) {
                    req.flash('error_msg', 'ERROR: '+err);
                    res.redirect('/registro');
                }
                req.flash('success_msg', 'Usuario registrado');
                res.redirect('/registro');
            });
            });
          });
      }
    })
  });
  router.post('/login', passport.authenticate('local', {
    successRedirect : '/dashboard',
    failureRedirect : '/login',
    failureFlash: 'Mail o Contraseña incorrecta, pruebe nuevamente'
  }));
router.post('/password/change', (req, res)=> {
  if(req.body.password !== req.body.confirmpassword) {
      req.flash('error_msg', "Password don't match. Type again!");
      return res.redirect('/password/change');
  }

  User.findOne({email : req.user.email})
      .then(user => {
          user.setPassword(req.body.password, err=>{
              user.save()
                  .then(user => {
                      req.flash('success_msg', 'Password changed successfully.');
                      res.redirect('/password/change');
                  })
                  .catch(err => {
                      req.flash('error_msg', 'ERROR: '+err);
                      res.redirect('/password/change');
                  });
          });
      });
});
router.post('/olvide', (req, res, next)=> {
})
router.post('/carrito', async (req, res) => {
  try {
    const { titulo, precio } = req.body;

    // Buscar el producto por título y precio
    const producto = await Product.findOne({ titulo, precio });

    // Si el producto existe, agregarlo al carrito
    if (producto) {
      if (req.session.carrito) {
        req.session.carrito.push(producto._id);
      } else {
        req.session.carrito = [producto._id];
      }

      req.flash('success_msg', 'Producto agregado al carrito exitosamente.');
      res.redirect('/carrito'); // Redirige a la página del carrito de compras
    } else {
      req.flash('error_msg', 'El producto seleccionado no existe.');
      res.redirect('/productos'); // Redirige a la página principal o de error
    }
  } catch (error) {
    console.error('Error al agregar el producto al carrito:', error);
    res.redirect('/productos'); // Redirige a la página principal o de error
  }
});
router.put('/usuarios/editar/:id', (req, res) => {
  let searchQuery = {_id: req.body.id};

  User.updateOne(searchQuery, {
    $set: {
      nombre: req.body.nombre,
      email: req.body.email
    }
  })
    .then(user => {
      req.flash('success_msg', 'Usuario actualizado.');
      res.redirect('/dashboard/usuarios');
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: ' + err);
      res.redirect('/dashboard/usuarios');
    });
});

router.put('/productos/editar/:id', (req, res) => {
  let searchQuery = {_id: req.body.id};

  Product.updateOne(searchQuery, {
    $set: {
      titulo: req.body.titulo,
      costo: req.body.costo,
      precio: req.body.precio,
      stock: req.body.stock
    }
  })
    .then(product => {
      req.flash('success_msg', 'Producto actualizado.');
      res.redirect('/dashboard/productos');
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: ' + err);
      res.redirect('/dashboard/productos');
    });
});

//DELETE routes starts here
router.delete('/delete/user/:id', (req, res)=>{
  let searchQuery = {_id : req.params.id};

  User.deleteOne(searchQuery)
      .then(user => {
          req.flash('success_msg', 'User deleted sucessfully.');
          res.redirect('/dashboard/usuarios');
      })
      .catch(err => {
          req.flash('error_msg', 'ERROR: '+err);
          res.redirect('/dashboard/usuarios');
      })
});


  
export default router


