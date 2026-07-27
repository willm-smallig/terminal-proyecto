// models/Employee.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Nombre completo obligatorio'],
      trim: true,
    },
    dni: {
      type: String,
      required: [true, 'DNI/NIE obligatorio'],
      unique: true,
      trim: true,
      uppercase: true, // Convierte siempre a mayúsculas
    },
    email: {
      type: String,
      required: [true, 'Correo corporativo obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: 'N/A',
    },
    // Rol dentro de la empresa / sistema de políticas
    corporateRole: {
      type: String,
      enum: ['Encargado Plantilla', 'Manejador Horarios', 'Plantilla Mañana', 'Plantilla Tarde'],
      required: [true, 'Rol corporativo obligatorio'],
    },
    // Turno asignado de atención al cliente
    shift: {
      type: String,
      enum: ['Mañana', 'Tarde', 'Partido', 'Sin Asignar'],
      default: 'Sin Asignar',
    },
    department: {
      type: String,
      default: 'Atención al Cliente',
    },
    status: {
      type: String,
      enum: ['Activo', 'Baja Temporal', 'Vacaciones', 'Inactivo'],
      default: 'Activo',
    },
    // Vincular al usuario autenticado que gestiona el registro
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Registra fecha de alta y última modificación automáticamente
  }
);

// Apuntamos explícitamente a la colección 'empleados' dentro de 'database'
const Employee = mongoose.model('Employee', employeeSchema, 'empleados');

export default Employee;