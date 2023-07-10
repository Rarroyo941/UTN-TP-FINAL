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

router.get('/login', (req,res)=>{
    res.render('pages/login')
})
router.get('/logout', isAuthenticatedUser,(req, res)=> {
  req.logOut();
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
router.get('/dashboard/usuarios', isAuthenticatedUser ,(req, res)=> {
  User.find({})
      .then(users => {
          res.render('admin/allusers', {users : users});
      })
      .catch(err => {
          req.flash('error_msg', 'ERROR: '+err);
          res.redirect('admin/allusers');
      })
});
router.get('/dashboard/usuarios/editar/:id',isAuthenticatedUser, (req,res)=>{
  let searchQuery = {_id : req.params.id};

    User.findOne(searchQuery)
        .then(user => {
        res.render('admin/edituser', {user : user});
        })
        .catch(err => {
        req.flash('error_msg', 'ERROR: '+err);
        res.redirect('/dashboard/usuarios');
    });
})


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

//PUT routes starts here

router.put('/dashboard/usuarios/editar/:id', (req, res)=> {
  let searchQuery = {_id : req.params.id};

  User.updateOne(searchQuery, {$set : {
      name : req.body.name,
      email : req.body.email
  }})
  .then(user => {
      req.flash('success_msg', 'User updated sucessfully.');
      res.redirect('/dashboard/usuarios');
  })
  .catch(err => {
      req.flash('error_msg', 'ERROR: '+err);
      res.redirect('/dashboard/usuarios');
  })
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
export default router


