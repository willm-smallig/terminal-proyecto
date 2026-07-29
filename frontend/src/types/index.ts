// src/types/index.ts

// Definición de Roles (debe coincidir con el backend)
export type CorporateRole = 
  | 'Encargado Plantilla' 
  | 'Manejador Horarios' 
  | 'Plantilla Mañana' 
  | 'Plantilla Tarde';

// Definición de Turnos
export type ShiftType = 'Mañana' | 'Tarde' | 'Partido' | 'Sin Asignar';

// Estructura del Usuario Autenticado
export interface User {
  _id: string;
  username: string;
  email: string;
  role: CorporateRole;
  token: string;
}

// Estructura del Empleado
export interface Employee {
  _id: string;
  fullName: string;
  dni: string;
  email: string;
  phone: string;
  corporateRole: CorporateRole;
  shift: ShiftType;
  department: string;
  status: 'Activo' | 'Baja Temporal' | 'Vacaciones' | 'Inactivo';
  createdAt?: string;
  updatedAt?: string;
}

// Estructura de la Respuesta del Login / Registro
export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  role: CorporateRole;
  token: string;
}