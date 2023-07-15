import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';
import flash from 'connect-flash';
import session from 'express-session';
import methodOverride from 'method-override';
import passport from 'passport';
import LocalStrategy from 'passport-local'
import userRouter from './routes/user.js'; // Importa el enrutador desde el archivo separado
import adminRouter from './routes/admin.js'
import User from './models/userModel.js';

const app = express();
dotenv.config({ path: './config.env' });

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
//  middleware de session
app.use(session({
  secret : process.env.CLAVE,
  resave : false,
  saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({usernameField : 'email'}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
// Middleware de method-override
app.use(methodOverride('_method'));
// Middleware de flash
app.use(flash());
app.use((req, res, next)=> {
  res.locals.success_msg = req.flash(('success_msg'));
  res.locals.error_msg = req.flash(('error_msg'));
  res.locals.error = req.flash(('error'));
  res.locals.currentUser = req.user;
  next();
});

// Rutas
app.use(userRouter); // Usa el enrutador userRouter
app.use(adminRouter)

app.listen(process.env.PORT, () => {
  console.log('El servidor se está ejecutando');
});
