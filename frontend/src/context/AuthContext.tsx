// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthResponse } from "../types";
import { loginApi, registerApi } from "../services/api";

// Definimos qué valores y funciones ofrecerá nuestro Contexto a toda la App
interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
}

// Creamos el Contexto con valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del Contexto (Componente envoltorio)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Persistencia de sesión: Al cargar la app, lee si ya había una sesión iniciada
  useEffect(() => {
    const storedUser = localStorage.getItem("user_session");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error al parsear la sesión guardada:", error);
        localStorage.removeItem("user_session");
      }
    }
    setLoading(false); // Finaliza la comprobación inicial
  }, []);

  // Función de Inicio de Sesión
  const login = async (credentials: { email: string; password: string }) => {
    const data = await loginApi(credentials);
    setUser(data);
    // Guardamos la sesión en el localStorage del navegador
    localStorage.setItem("user_session", JSON.stringify(data));
  };

  // Función de Registro
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const data = await registerApi(userData);
    setUser(data);
    localStorage.setItem("user_session", JSON.stringify(data));
  };

  // Función de Cierre de Sesión (Logout)
  // Limpia el estado de autenticación y toda huella de sesión en localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user_session");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // Transforma la existencia del objeto user en un booleano (true/false)
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook personalizado para consumir el contexto fácilmente en cualquier componente
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};
