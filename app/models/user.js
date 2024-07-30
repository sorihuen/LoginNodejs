import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  lastPasswordResetRequest: Date, // Nuevo campo // almacenar la fecha y hora de la última solicitud de recuperación
});

export const User = mongoose.model("User", userSchema);
