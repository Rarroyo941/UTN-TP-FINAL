import express from "express";

import User from '../models/userModel.js';
import Product from '../models/productmodel.js';


const adminRouter = express.Router();

function isAuthenticatedUser(req, res, next) {
  if(req.isAuthenticated()) {
      return next();
  }
  req.flash('error_msg', 'Por favor ingrese sesión.')
  res.redirect('/login');
}


adminRouter.get('/dashboard/productos', isAuthenticatedUser,(req,res)=>{
  Product.find({})
  .then(products => {
      res.render('admin/allproducts', {products:products});
  })
  .catch(err => {
      req.flash('error_msg', 'ERROR: '+err);
      res.redirect('admin/allproducts');
  })
});

adminRouter.get('/dashboard/usuarios', isAuthenticatedUser ,(req, res)=> {
  User.find({})
      .then(users => {
          res.render('admin/allusers', {users : users});
      })
      .catch(err => {
          req.flash('error_msg', 'ERROR: '+err);
          res.redirect('admin/allusers');
      })
});
adminRouter.get('/dashboard/usuarios/editar/:id', isAuthenticatedUser, (req, res) => {
  let searchQuery = {_id: req.params.id};

  User.findOne(searchQuery)
    .then(user => {
      res.render('admin/edituser', {user: user});
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: ' + err);
      res.redirect('/dashboard/usuarios');
    });
});

adminRouter.get('/dashboard/productos/editar/:id', isAuthenticatedUser, (req, res) => {
  let searchQuery = {_id: req.params.id};

  Product.findOne(searchQuery)
    .then(product => {
      res.render('admin/editproduct', {product: product});
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: ' + err);
      res.redirect('/dashboard/productos');
    });
});


  
adminRouter.delete('/productos/eliminar/:id', (req, res)=>{
  let searchQuery = {_id : req.params.id};

  Product.findByIdAndDelete(searchQuery)
      .then(user => {
          req.flash('success_msg', 'Producto eliminado.');
          res.redirect('/dashboard/productos');
      })
      .catch(err => {
          req.flash('error_msg', 'ERROR: '+err);
          res.redirect('/dashboard/productos');
      })
});
adminRouter.delete('/usuarios/eliminar/:id', (req, res)=>{
  let searchQuery = {_id : req.params.id};

  User.findByIdAndDelete(searchQuery)
      .then(user => {
          req.flash('success_msg', 'Usuario eliminado.');
          res.redirect('/dashboard/usuarios');
      })
      .catch(err => {
          req.flash('error_msg', 'ERROR: '+err);
          res.redirect('/dashboard/usuarios');
      })
});
adminRouter.post('/usuarios/editar/:id', (req, res) => {
  let searchQuery = {_id: req.params.id};

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

adminRouter.post('/productos/editar/:id', (req, res) => {
  let searchQuery = {_id: req.params.id};

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

export default adminRouter