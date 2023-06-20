import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';
import flash from 'connect-flash';
import session from 'express-session';
import MethodOverride from 'method-override';
import passport from 'passport';

const app = express()
mongoose.connect('mongodb+srv://Admin:12345@cluster0.gz1bmpq.mongodb.net/Productos?retryWrites=true&w=majority', { 
    useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Conexión exitosa a MongoDB Atlas');
})
.catch((error) => {
  console.error('Error al conectar con MongoDB Atlas:', error);
});

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.set('view engine','ejs')

app.get('/', (req,res)=>{
    res.render('pages/index')
})
app.get('/login', (req,res)=>{
    res.render('pages/login')
})
app.get('/olvide', (req,res)=>{
    res.render('pages/olvide')
})
app.get('/registro', (req,res)=>{
    res.render('pages/registro')
})
app.get('/productos', (req,res)=>{
    /*const datos = Product.find()*/
    res.render('pages/productos', { datos: datos })
})
app.get('/contacto', (req,res)=>{
    res.render('pages/contacto')
})
app.get('/nosotros', (req,res)=>{
    res.render('pages/nosotros')
})
app.get('/envios', (req,res)=>{
    res.render('pages/delivery')
})
app.get('/pagos', (req,res)=>{
    res.render('pages/mediosPago')
})

app.listen(3030,(req,res)=>{
    console.log('el servidor se esta ejecutando')
})



