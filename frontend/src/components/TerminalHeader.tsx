// src/components/TerminalHeader.tsx
import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonChip,
} from "@ionic/react";
import { logOutOutline, terminalOutline } from "ionicons/icons";
import { useAuth } from "../context/AuthContext";

export const TerminalHeader: React.FC = () => {
  const { user, logout } = useAuth();

  // Asigna un color según el rol del empleado
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "Encargado Plantilla":
        return { color: "#ffb000", border: "1px solid #ffb000" }; // Admin
      case "Manejador Horarios":
        return { color: "#58a6ff", border: "1px solid #58a6ff" }; // Supervisor
      default:
        return { color: "#00ff66", border: "1px solid #00ff66" }; // Operativo
    }
  };

  const badgeStyle = getRoleBadgeColor(user?.role);

  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle slot="start">
          <IonIcon
            icon={terminalOutline}
            style={{
              marginRight: "8px",
              verticalAlign: "middle",
              color: "#00ff66",
            }}
          />
          TERMINAL_OPERATOR v1.0
        </IonTitle>

        {user && (
          <div
            slot="end"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              paddingRight: "10px",
            }}
          >
            {/* Indicador de Usuario y Servidor */}
            <span
              style={{
                fontSize: "0.85rem",
                color: "#8b949e",
                fontFamily: "monospace",
              }}
            >
              <span style={{ color: "#00ff66" }}>{user.username}</span>
              @callcenter-cli
            </span>

            {/* Insignia de Rol Corporativo */}
            <IonChip
              style={{
                ...badgeStyle,
                background: "transparent",
                fontSize: "0.75rem",
                height: "24px",
              }}
            >
              {user.role}
            </IonChip>

            {/* Estado del JWT */}
            <span
              style={{
                fontSize: "0.75rem",
                color: "#00ff66",
                border: "1px dashed #00ff66",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              [JWT: ACTIVO]
            </span>

            {/* Botón Logout estilo Comando '$ exit' */}
            <IonButton
              fill="clear"
              size="small"
              onClick={logout}
              style={{
                "--color": "#ff5555",
                fontFamily: "monospace",
                fontWeight: "bold",
              }}
            >
              <IonIcon slot="start" icon={logOutOutline} />$ exit
            </IonButton>
          </div>
        )}
      </IonToolbar>
    </IonHeader>
  );
};
