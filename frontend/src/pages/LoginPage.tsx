// src/pages/LoginPage.tsx
import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import {
  terminalOutline,
  lockClosedOutline,
  personOutline,
  alertCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { verifyUsernameApi } from "../services/api";
import "./LoginPage.css";

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1); // Paso 1: Username, Paso 2: Password
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  const [systemLogs, setSystemLogs] = useState<string[]>([
    "Sistema Corporativo De Atención Al Cliente v1.0",
    "Conexión segura establecida con MongoDB Atlas.",
    "Introduzca nombre de usuario/operador para continuar.",
  ]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const history = useHistory();

  // Paso 1: Valida si el username existe en la base de datos
  const handleVerifyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await verifyUsernameApi(username.trim());
      setUserRole(res.role || "");
      setSystemLogs((prev) => [
        ...prev,
        `$ verify-operator ${username}`,
        `OPERADOR IDENTIFICADO: [${res.role || ""}]`,
        "Ingrese contraseña de acceso (oculta por seguridad):",
      ]);
      setStep(2); // va al paso de la contraseña
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Error: Operador no encontrado";
      setErrorMsg(msg);
      setSystemLogs((prev) => [
        ...prev,
        `$ verify-operator ${username}`,
        `${msg}`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Enviar el Login completo (Email o Username + Password)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setErrorMsg("");

    try {
      // El backend ahora soporta login por username o email
      await login({
        email: username,
        password,
      });

      setSystemLogs((prev) => [
        ...prev,
        "$ auth --check-credentials",
        "ACCESO CONCEDIDO. Redirigiendo a la Terminal...",
      ]);

      setTimeout(() => {
        history.push("/terminal");
      }, 1000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Contraseña incorrecta";
      setErrorMsg(msg);
      setSystemLogs((prev) => [
        ...prev,
        "$ auth --check-credentials",
        `ACCESO DENEGADO: ${msg}`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding login-page-content">
        <div className="terminal-window">
          {/* Barra Superior Ventana Terminal */}
          <div className="terminal-titlebar">
            <div className="terminal-titlebar__dots">
              <span className="terminal-dot terminal-dot--red"></span>
              <span className="terminal-dot terminal-dot--amber"></span>
              <span className="terminal-dot terminal-dot--green"></span>
            </div>
            <span className="terminal-titlebar__title">
              bash - operator_login@terminal
            </span>
            <div></div>
          </div>

          {/* Historial / Logs de Consola */}
          <div className="terminal-logs">
            {systemLogs.map((log, index) => (
              <div key={index} className="terminal-logs__line">
                {log}
              </div>
            ))}
          </div>

          {/* Formulario CLI en 2 Pasos */}
          <div className="terminal-form-section">
            {/* Paso 1: Username */}
            {step === 1 && (
              <form onSubmit={handleVerifyUser}>
                <div className="terminal-input-row">
                  <span className="terminal-prompt--green">
                    login:~$
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="introduzca_usuario"
                    autoFocus
                    className="terminal-input"
                  />
                  <IonButton
                    type="submit"
                    size="small"
                    fill="outline"
                    disabled={loading}
                    className="terminal-btn--green"
                  >
                    {loading ? <IonSpinner name="dots" /> : "Siguiente >"}
                  </IonButton>
                </div>
              </form>
            )}

            {/* Paso 2: Password (Estilo Linux: Sin Asteriscos) */}
            {step === 2 && (
              <form onSubmit={handleLoginSubmit}>
                <div className="terminal-operator-info">
                  Operador: <span className="terminal-operator-info__username">{username}</span>{" "}
                  | Rol: <span className="terminal-operator-info__role">{userRole}</span>
                </div>
                <div className="terminal-input-row">
                  <span className="terminal-prompt--amber">
                    Password:
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="" // Vacío a propósito para simular terminal
                    autoFocus
                    className="terminal-input--password"
                  />
                  <IonButton
                    type="submit"
                    size="small"
                    fill="outline"
                    disabled={loading}
                    className="terminal-btn--amber"
                  >
                    {loading ? <IonSpinner name="dots" /> : "Autenticar"}
                  </IonButton>
                </div>
                <div className="terminal-security-note">
                  * La contraseña no mostrará caracteres en pantalla por
                  política de seguridad CLI.
                </div>
              </form>
            )}

            {/* Mensaje de Error */}
            {errorMsg && (
              <div className="terminal-error">
                <IonIcon icon={alertCircleOutline} />
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

