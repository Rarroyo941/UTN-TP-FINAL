import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import flash from 'connect-flash';
import session from 'express-session';
import methodOverride from 'method-override';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import adminRouter from './routes/admin.js';
import userRouter from './routes/user.js';
import User from './models/usermodel.js';
import MongoStore from 'connect-mongo';

const app = express();
dotenv.config({ path: './config.env' });

mongoose.connect('mongodb+srv://Admin:12345@cluster0.gz1bmpq.mongodb.net/ProductosBD?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Conexión exitosa a MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB Atlas:', error);
  });

// middleware de session
app.use(session({
  secret: 'login/registro',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: 'mongodb+srv://Admin:12345@cluster0.gz1bmpq.mongodb.net/ProductosBD?retryWrites=true&w=majority'})
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
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
app.use((req, res, next) => {
  res.locals.carrito = req.session.carrito;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
});

// Rutas
app.use(userRouter); // Usa el enrutador userRouter
app.use(adminRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
