// src/services/api.ts
import axios from "axios";
import type { AuthResponse, Employee } from "@/types";

// Instancia global de Axios con la URL base de nuestro servidor Node.js
const API = axios.create({
  baseURL: "https://back-render-itwv.onrender.com/api", // URL del Backend Express
});

// Interceptor de peticiones (Inyección automática del Token JWT)
API.interceptors.request.use((config) => {
  // Leemos los datos del usuario guardados en el localStorage
  const storedUser = localStorage.getItem("user_session");

  if (storedUser) {
    const user: AuthResponse = JSON.parse(storedUser);
    // Inyectamos el token en la cabecera
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

// Servicios de autenticación (login y registro)

export const verifyUsernameApi = async (
  username: string,
): Promise<{
  exists: boolean;
  role?: string;
  message: string;
}> => {
  const response = await API.post("/auth/verify-user", { username });
  return response.data;
};

export const loginApi = async (credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};

export const registerApi = async (userData: {
  username: string;
  email: string;
  password: string;
  role: string;
}): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/register", userData);
  return response.data;
};

// Servicio del CRUD de empleado

// Obtener la plantilla de empleados
export const getEmployeesApi = async (shift?: string): Promise<Employee[]> => {
  const url = shift ? `/employees?shift=${shift}` : "/employees";
  const response = await API.get<Employee[]>(url);
  return response.data;
};

// Crear un nuevo empleado
export const createEmployeeApi = async (
  employeeData: Partial<Employee>,
): Promise<Employee> => {
  const response = await API.post<Employee>("/employees", employeeData);
  return response.data;
};

// Actualizar un empleado o su turno
export const updateEmployeeApi = async (
  id: string,
  employeeData: Partial<Employee>,
): Promise<Employee> => {
  const response = await API.put<Employee>(`/employees/${id}`, employeeData);
  return response.data;
};

// Eliminar un empleado
export const deleteEmployeeApi = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await API.delete<{ message: string }>(`/employees/${id}`);
  return response.data;
};

export default API;
