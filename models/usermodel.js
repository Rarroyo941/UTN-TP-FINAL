import mongoose from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose'

let userSchema= new mongoose.Schema({
    nombre: {
        type: String,
        required: true
      },
    email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true,
      },
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

userSchema.plugin(passportLocalMongoose, {usernameField : 'email'});

const User = mongoose.model('User', userSchema);

export default User;
