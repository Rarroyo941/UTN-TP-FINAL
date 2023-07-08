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
import { Strategy as LocalStrategy } from 'passport-local';
import userRouter from './routes/user.js'; // Importa el enrutador desde el archivo separado

import User from './models/usermodel.js';

const app = express();
dotenv.config({ path: './.env' });

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

// Configuración de sesión
app.use(session({
  secret: 'Se logueo en la aplicacion',
  resave: false,
  saveUninitialized: false,
}));

// Middleware de flash
app.use(flash());

// Middleware de locals
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
});

// Inicialización de Passport y sesión
app.use(passport.initialize());
app.use(passport.session());

// Configuración de la estrategia de autenticación local
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user || !user.verifyPassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Rutas
app.use(userRouter); // Usa el enrutador userRouter

app.listen(process.env.PORT, () => {
  console.log('El servidor se está ejecutando');
});
