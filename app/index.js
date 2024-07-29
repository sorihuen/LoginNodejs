import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { methods as authentication } from "./controllers/authentication.controller.js";
import dotenv from "dotenv";

// Definición de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Cargar las variables de entorno
dotenv.config();

// Conexión a MongoDB Atlas
const mongoDB = process.env.MONGODB_URI;
if (!mongoDB) {
  console.error(
    "No se ha definido la URI de MongoDB. Asegúrate de que el archivo .env contiene MONGODB_URI"
  );
  process.exit(1);
}
mongoose.connect(mongoDB).then(
  () => {
    console.log("Conectado a MongoDB Atlas");
  },
  (err) => {
    console.error("Error de conexión a MongoDB:", err);
    process.exit(1);
  }
);

// Server
const app = express();
app.set("port", 4000);

app.listen(app.get("port"), () => {
  console.log("Servidor corriendo en puerto", app.get("port"));
});

//Configuracion
app.use(express.static(__dirname + "/public"));
app.use(express.json());

// Routes
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "pages", "login.html"))
);
app.get("/register", (req, res) =>
  res.sendFile(path.join(__dirname, "pages", "register.html"))
);
app.get("/admin", (req, res) =>
  res.sendFile(path.join(__dirname, "pages", "admin.html"))
);
app.get("/forgot-password", (req, res) =>
  res.sendFile(path.join(__dirname, "pages", "forgot-password.html"))
);
app.get("/reset-password", (req, res) =>
  res.sendFile(path.join(__dirname, "pages", "reset-password.html"))
);

app.post("/api/login", authentication.login);
app.post("/api/register", authentication.register);

app.post("/api/forgot-password", authentication.forgotPassword);
app.post("/api/reset/:token", authentication.resetPassword);
app.post("/api/reset-password/:token", authentication.resetPassword);
