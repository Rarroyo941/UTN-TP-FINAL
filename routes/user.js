import express from "express";
import session from "express-session";
import passport from "passport";
import bcrypt from 'bcrypt';
import User from '../models/usermodel.js';
import Product from '../models/productmodel.js';
import crypto from 'crypto';
import async from 'async';
import nodemailer from 'nodemailer';
import LocalStrategy from 'passport-local';

const router = express.Router();
const carritoLengthMiddleware = (req, res, next) => {
  if (req.session.carrito) {
    res.locals.carritoLength = req.session.carrito.length;
  } else {
    res.locals.carritoLength = 0;
  }
  next();
};
router.use(carritoLengthMiddleware)
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
  req.logout((err) => {
    if (err) {
      console.error('Error al salir sesión:', err);
    }
    req.flash('success_msg', 'Ha cerrado sesión.');
    res.redirect('/login');
  });
});
router.get('/olvide', (req,res)=>{
    res.render('pages/olvide')
})
router.get('/registro', (req,res)=>{
    res.render('pages/registro')
})
router.get('/reset/:token', (req, res)=> {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
    .then(user => {
      if (!user) {
        req.flash('error_msg', 'El token para restablecer la contraseña es inválido o ha expirado.');
        return res.redirect('/olvide');
      }

      res.render('pages/newpassword', { token: req.params.token });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: ' + err);
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
router.get('/carrito', async (req, res) => {
  try {
    const productosEnCarrito = req.session.carrito || []; // If cart is empty, initialize an empty array

    let total = 0;
    for (const producto of productosEnCarrito) {
      total += parseFloat(producto.precio) * producto.cantidad;
    }
    const user = req.user;
    res.render('pages/carrito', { productosEnCarrito, total, user }); // Pass the data to the view for rendering
  } catch (error) {
    console.error('Error al obtener los productos del carrito:', error);
    res.redirect('/'); // Redirige a la página principal o de error
  }
});
router.get('/carrito/agregar/:id', async (req, res) => {
  try {
    let productId = req.params.id;
    const producto = await Product.findById(productId);

    if (!producto) {
      req.flash('error_msg', 'El producto no existe.');
      return res.redirect('/');
    }

    if (typeof req.session.carrito === 'undefined') {
      req.session.carrito = [];
      req.session.carrito.push({
        titulo: producto.titulo,
        cantidad: 1,
        precio: parseFloat(producto.precio).toFixed(2),
      });
    } else {
      let carrito = req.session.carrito;
      let nuevoItem = true;
      for (var i = 0; i < carrito.length; i++) {
        if (carrito[i].titulo == producto.titulo) {
          carrito[i].cantidad++;
          nuevoItem = false;
          break;
        }
      }
      if (nuevoItem) {
        carrito.push({
          titulo: producto.titulo,
          cantidad: 1,
          precio: parseFloat(producto.precio).toFixed(2),
        });
      }
    }
    req.flash('success_msg', 'Producto agregado exitosamente');
    res.redirect('back');
  } catch (error) {
    console.error('Error al agregar el producto al carrito:', error);
    req.flash('error_msg', 'Error al agregar el producto al carrito.');
    res.redirect('/');
  }
});
router.get('/pedidoRealizado', isAuthenticatedUser, async (req, res)=>{
  res.render('pages/pedidoRealizado')
})
router.get('/carrito/editar/:titulo', (req, res) => {
  let titulo = req.params.titulo;
  let carrito = req.session.carrito;
  let action = req.query.action;
  for (let i = 0; i < carrito.length; i++) {
    if (carrito[i].titulo == titulo) {
      switch (action) {
        case "agregar":
          carrito[i].cantidad++;
          break;
        case "restar":
          carrito[i].cantidad--;
          break;
        case "eliminar":
          carrito.splice(i, 1);
          if (carrito.length == 0) delete req.session.carrito;
          break;
        default:
          console.log('Problema para actualizar');
          break;
      }
      break;
    }
  }
  req.flash('success_msg', 'Carrito actualizado');
  res.redirect('/carrito');
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
  // Generar un token aleatorio
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.error('Error al generar el token:', err);
      req.flash('error_msg', 'Ha ocurrido un error al generar el token.');
      return res.redirect('/olvide');
    }
    
    const token = buffer.toString('hex');
    
    // Buscar el usuario por su correo electrónico
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error_msg', 'No se encontró un usuario con este correo electrónico.');
          return res.redirect('/olvide');
        }

        // Establecer el token y la fecha de vencimiento en el usuario
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora de validez para el token

        user.save()
          .then(user => {
            // Enviar el correo electrónico con el enlace para restablecer la contraseña
            const transporter = nodemailer.createTransport({
              // Configura tus credenciales de correo electrónico aquí
              service: 'Gmail',
              auth: {
                user: 'cfood@cfood.com',
                pass: '12345'
              }
            });

            const mailOptions = {
              from: 'cfood@cfood.com',
              to: user.email,
              subject: 'Recuperación de contraseña',
              text: `Hola ${user.nombre},\n\n` +
                    'Has solicitado restablecer tu contraseña.\n\n' +
                    'Haz clic en el siguiente enlace o pégalo en tu navegador para completar el proceso:\n\n' +
                    `http://${req.headers.host}/reset/${token}\n\n` +
                    'Si no solicitaste restablecer tu contraseña, ignora este correo y tu contraseña no cambiará.\n'
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error('Error al enviar el correo electrónico:', error);
                req.flash('error_msg', 'Ha ocurrido un error al enviar el correo electrónico.');
                return res.redirect('/olvide');
              }

              req.flash('success_msg', 'Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña.');
              res.redirect('/olvide');
            });
          })
          .catch(err => {
            console.error('Error al guardar el token en la base de datos:', err);
            req.flash('error_msg', 'Ha ocurrido un error al guardar el token en la base de datos.');
            res.redirect('/olvide');
          });
      })
      .catch(err => {
        console.error('Error al buscar el usuario en la base de datos:', err);
        req.flash('error_msg', 'Ha ocurrido un error al buscar el usuario en la base de datos.');
        res.redirect('/olvide');
      });
  });
});
router.post('/reset/:token', (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
    .then(user => {
      if (!user) {
        req.flash('error_msg', 'El token para restablecer la contraseña es inválido o ha expirado.');
        return res.redirect('/olvide');
      }

      if (req.body.password !== req.body.confirmpassword) {
        req.flash('error_msg', "Las contraseñas no coinciden. Por favor, inténtalo de nuevo.");
        return res.redirect(`/reset/${req.params.token}`);
      }

      // Actualizar la contraseña en la base de datos
      user.setPassword(req.body.password, err => {
        if (err) {
          req.flash('error_msg', 'Ha ocurrido un error al restablecer la contraseña.');
          return res.redirect(`/reset/${req.params.token}`);
        }

        // Limpiar los campos de reseteo de contraseña en el modelo del usuario
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save()
          .then(user => {
            req.flash('success_msg', 'La contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.');
            res.redirect('/login');
          })
          .catch(err => {
            req.flash('error_msg', 'Ha ocurrido un error al guardar la nueva contraseña.');
            res.redirect(`/reset/${req.params.token}`);
          });
      });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: ' + err);
      res.redirect('/olvide');
    });
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


