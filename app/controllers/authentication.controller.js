import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//Lógica Login
async function login(req, res) {
  //console.log("Inicio de la función login");
  const { email, password } = req.body;
  //console.log("Email recibido:", email);

  // Verificar si se proporcionaron email y password
  if (!email || !password) {
    //console.log("Error: Email o contraseña faltantes");
    return res.status(400).json({
      status: "Error",
      message: "Email y contraseña son requeridos",
    });
  }

  try {
    //console.log("Buscando usuario en la base de datos");
    const user = await User.findOne({ email });
    //console.log("Usuario encontrado:", user ? "Sí" : "No");

    // Si no se encuentra el usuario
    if (!user) {
      //console.log("Error: Usuario no encontrado");
      return res
        .status(401)
        .json({ status: "Error", message: "Email o contraseña incorrectos" });
    }

    //console.log("Verificando contraseña");
    const isMatch = await bcrypt.compare(password, user.password);
    //console.log("Contraseña correcta:", isMatch ? "Sí" : "No");

    if (!isMatch) {
      //console.log("Error: Contraseña incorrecta");
      return res
        .status(401)
        .json({ status: "Error", message: "Email o contraseña incorrectos" });
    }

    //console.log("Autenticación exitosa, generando token");
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    //console.log("Enviando respuesta exitosa");
    res.status(200).json({
      status: "Success",
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        user: user.user,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ status: "Error", message: "Error del servidor" });
  }
}

//***** * Lógica Register ********

async function register(req, res) {
  const { user, email, password } = req.body;

  if (!user || !email || !password) {
    return res
      .status(400)
      .send({ status: "Error", message: "Los campos están incompletos" });
  }

  try {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send({ status: "Error", message: "El email ya está registrado" });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const newUser = new User({
      user,
      email,
      password: hashedPassword,
    });

    // Guardar el usuario en la base de datos
    await newUser.save();

    res
      .status(201)
      .send({ status: "Success", message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).send({ status: "Error", message: "Error del servidor" });
  }
}

//*****Lógica Recuperar Contraseña*****

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ status: "Error", message: "Email es requerido" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ status: "Error", message: "Usuario no encontrado" });
    }

    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000; // 10 minutos

    // Verifica si ha pasado más de 10 minutos desde la última solicitud
    if (
      user.lastPasswordResetRequest &&
      now - user.lastPasswordResetRequest < tenMinutes
    ) {
      return res
        .status(429)
        .json({
          status: "Error",
          message:
            "Ya has solicitado un restablecimiento de contraseña recientemente. Intenta de nuevo más tarde.",
        });
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = now + 3600000; // 1 hora
    user.lastPasswordResetRequest = now; // Actualiza la fecha de la última solicitud

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recuperación de contraseña",
      text: `Haz clic en el siguiente enlace para recuperar tu contraseña: http://localhost:4000/reset-password?token=${token}`,
    });

    res.status(200).json({
      status: "Success",
      message: "Instrucciones de recuperación enviadas a tu email.",
    });
  } catch (error) {
    console.error("Error enviando el correo:", error);
    res.status(500).json({ status: "Error", message: "Error del servidor" });
  }
}

//****** Actualizar contraseña ******

async function resetPassword(req, res) {
  const { token } = req.params;
  const { newPassword } = req.body;

  console.log("resetPassword - Token recibido:", token);
  console.log("resetPassword - Nueva contraseña recibida:", newPassword);

  if (!token || !newPassword) {
    return res.status(400).json({
      status: "Error",
      message: "Token y nueva contraseña son requeridos",
    });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Verifica si el token no ha expirado
    });
    console.log("resetPassword - Usuario encontrado:", user);

    if (!user) {
      return res
        .status(400)
        .json({ status: "Error", message: "Token inválido o expirado" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined; // Elimina el token
    user.resetPasswordExpires = undefined; // Elimina la expiración

    await user.save();
    console.log("resetPassword - Contraseña actualizada correctamente");

    res.status(200).json({
      status: "Success",
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("resetPassword - Error al actualizar la contraseña:", error);
    res.status(500).json({ status: "Error", message: "Error del servidor" });
  }
}

export const methods = {
  login,
  register,
  forgotPassword,
  resetPassword,
};
