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
import userRouter from './routes/user.js';

const app = express();
dotenv.config({path:'./.env'})

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Conexión exitosa a MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB Atlas:', error);
  });

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(userRouter);
app.use(flash());

app.listen(process.env.PORT, (req, res) => {
  console.log('El servidor se está ejecutando');
});





