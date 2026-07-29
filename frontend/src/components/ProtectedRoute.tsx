// src/components/ProtectedRoute.tsx
import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CorporateRole } from '../types';

interface ProtectedRouteProps extends Omit<RouteProps, 'children'> {
  allowedRoles?: CorporateRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  ...rest
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <Route
      {...rest}
      render={({ location }) => {
        // Mientras se comprueba si hay sesión en localStorage, se muestra la pantalla de carga
        if (loading) {
          return (
            <div style={{ background: '#0d1117', color: '#00ff66', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
              {'>'} Cargando sistema de seguridad CLI...
            </div>
          );
        }

        // Si no está autenticado, redirige al Login guardando la ruta de origen
        if (!isAuthenticated) {
          return (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: location },
              }}
            />
          );
        }

        // Control de roles: Si la ruta exige roles específicos y el usuario no los tiene
        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
          return (
            <Redirect
              to={{
                pathname: '/terminal',
              }}
            />
          );
        }

        // Si pasa todas las validaciones, renderiza la pantalla protegida
        return children;
      }}
    />
  );
};