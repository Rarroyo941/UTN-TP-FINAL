import mongoose from "mongoose";

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
        select: false
      },
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

const User = mongoose.model('User', userSchema);

export default User;
