import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Nombre de usuario obligatorio'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Correo electrónico obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Contraseña obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
    role: {
      type: String,
      enum: ['Encargado Plantilla', 'Manejador Horarios', 'Plantilla Mañana', 'Plantilla Tarde'],
      default: 'Plantilla Mañana', // Rol por defecto si no se especifica
    },
  },
  {
    timestamps: true, // Crea automáticamente los campos createdAt y updatedAt
  }
);

// MIDDLEWARE DE MONGOOSE: Cifrado automático de contraseñas
userSchema.pre('save', async function (next) {
  // Si la contraseña no ha sido modificada, pasamos al siguiente middleware
  if (!this.isModified('password')) {
    return next();
  }

  // Generamos una "salt" (cadena aleatoria de seguridad) y encripta la clave
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// MÉTODO PERSONALIZADO: Comparar la contraseña ingresada con la encriptada
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;