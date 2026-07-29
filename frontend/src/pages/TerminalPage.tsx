// src/pages/TerminalPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { TerminalHeader } from "../components/TerminalHeader";
import { useAuth } from "../context/AuthContext";
import { Employee } from "../types";
import {
  getEmployeesApi,
  createEmployeeApi,
  updateEmployeeApi,
  deleteEmployeeApi,
} from "../services/api";
import "./TerminalPage.css";

export const TerminalPage: React.FC = () => {
  const { user } = useAuth();
  const [commandInput, setCommandInput] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [history, setHistory] = useState<
    Array<{ type: "cmd" | "res" | "error" | "table"; content: any }>
  >([
    {
      type: "res",
      content: "Sistema de Atención al Cliente CLI v1.0",
    },
    {
      type: "res",
      content:
        'Escriba "help" para ver el catálogo de comandos disponibles según su rol.',
    },
  ]);

  const outputRef = useRef<HTMLDivElement>(null);

  // Carga inicial de la plantilla
  const fetchPlantilla = async (shiftFilter?: string) => {
    try {
      const data = await getEmployeesApi(shiftFilter);
      setEmployees(data);
      return data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Error al conectar con la base de datos",
      );
    }
  };

  useEffect(() => {
    fetchPlantilla();
  }, []);

  // Auto-scroll al final de la pantalla estilo terminal - (copiado a Manu)
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  // Intérprete de comandos de la terminal
  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    // Guarda los comandos ejecutados en la pantalla
    setHistory((prev) => [...prev, { type: "cmd", content: `$ ${cmd}` }]);
    setCommandInput("");

    const args = cmd.split(" ");
    const mainCmd = args[0].toLowerCase();

    try {
      switch (mainCmd) {
        case "help":
        case "?":
          setHistory((prev) => [
            ...prev,
            {
              type: "res",
              content: `
Comandos disponibles:

  list                      : Lista todos los empleados de la plantilla.
  list --shift=Mañana       : Filtra la plantilla por turno (Mañana / Tarde).
  add <nombre> <dni> <email> <rol> <turno>
                            : Solo Encargado: Registra nuevo empleado.
                            : Ejemplo: add "Juan Perez" 12345678A juan@emp.com "Plantilla Mañana" "Mañana"
  shift <id> <nuevo_turno>  : Encargado / Manejador: Cambia turno (Mañana / Tarde / Partido).
  delete <id>               : Solo Encargado: Elimina un empleado por su ID.
  clear                     : Limpia la pantalla de la terminal.`,
            },
          ]);
          break;

        case "clear":
          setHistory([]);
          break;

        case "list":
          const shiftArg = args.find((a) => a.startsWith("--shift="));
          const shiftValue = shiftArg ? shiftArg.split("=")[1] : undefined;

          const data = await fetchPlantilla(shiftValue);
          setHistory((prev) => [
            ...prev,
            { type: "table", content: data },
            {
              type: "res",
              content: `Registros devueltos desde MongoDB: ${data.length}`,
            },
          ]);
          break;

        case "add":
          if (user?.role !== "Encargado Plantilla") {
            throw new Error(
              "ACCESO DENEGADO: Solo el rol [Encargado Plantilla] puede añadir personal.",
            );
          }
          // Formato: add "Nombre Apellido" DNI Email "Rol Corporativo" "Turno"
          // Extraer todos los tokens (respeta cadenas entre comillas como un solo token)
          const addTokens = cmd.match(/"([^"]+)"|(\S+)/g)?.map((t) =>
            t.replace(/^"|"$/g, ""),
          );

          if (!addTokens || addTokens.length < 6) {
            throw new Error(
              'Faltan datos. Ejemplo: add "Ana Sola" 88888888Z ana@company.com "Plantilla Tarde" "Tarde"',
            );
          }

          // addTokens[0] = "add", [1] = fullName, [2] = dni, [3] = email, [4] = corporateRole, [5] = shift
          const [, addFullName, addDni, addEmail, addRole, addShift] = addTokens;

          const newEmp = await createEmployeeApi({
            fullName: addFullName,
            dni: addDni,
            email: addEmail,
            corporateRole: addRole as any,
            shift: addShift as any,
          });

          await fetchPlantilla();
          setHistory((prev) => [
            ...prev,
            {
              type: "res",
              content: `Empleado creado con éxito [ID: ${newEmp._id}]`,
            },
          ]);
          break;

        case "shift":
          if (
            user?.role !== "Encargado Plantilla" &&
            user?.role !== "Manejador Horarios"
          ) {
            throw new Error(
              "ACCESO DENEGADO: No tiene permisos de supervisión para alterar turnos.",
            );
          }
          if (args.length < 3) {
            throw new Error("Uso: shift <id_empleado> <nuevo_turno>");
          }
          const targetId = args[1];
          const newShift = args[2];

          await updateEmployeeApi(targetId, { shift: newShift as any });
          await fetchPlantilla();
          setHistory((prev) => [
            ...prev,
            {
              type: "res",
              content: `Turno actualizado correctamente para el registro ${targetId}`,
            },
          ]);
          break;

        case "delete":
          if (user?.role !== "Encargado Plantilla") {
            throw new Error(
              "ACCESO DENEGADO: Solo [Encargado Plantilla] puede dar de baja registros.",
            );
          }
          if (args.length < 2) {
            throw new Error("Uso: delete <id_empleado>");
          }
          const delId = args[1];
          await deleteEmployeeApi(delId);
          await fetchPlantilla();
          setHistory((prev) => [
            ...prev,
            {
              type: "res",
              content: `Empleado eliminado de la base de datos [ID: ${delId}]`,
            },
          ]);
          break;

        default:
          setHistory((prev) => [
            ...prev,
            {
              type: "error",
              content: `Comando no reconocido: "${mainCmd}". Escriba "help" para ver lista.`,
            },
          ]);
      }
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        { type: "error", content: `ERROR: ${err.message}` },
      ]);
    }
  };

  return (
    <IonPage>
      <TerminalHeader />
      <IonContent className="ion-padding">
        <div className="terminal-container">
          {/* Barra superior ventana */}
          <div className="terminal-window-header">
            <div className="window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-amber"></span>
              <span className="dot dot-green"></span>
            </div>
            <span className="terminal-title-text">
              bash - operator@callcenter-db: ~/base
            </span>
            <span></span>
          </div>

          {/* Area de salida de la terminal */}
          <div className="terminal-output-area" ref={outputRef}>
            {history.map((item, index) => {
              if (item.type === "cmd") {
                return (
                  <div
                    key={index}
                    className="terminal-log-line"
                    style={{ color: "#00ff66", fontWeight: "bold" }}
                  >
                    {item.content}
                  </div>
                );
              }
              if (item.type === "error") {
                return (
                  <div
                    key={index}
                    className="terminal-log-line"
                    style={{ color: "#ff5555" }}
                  >
                    {item.content}
                  </div>
                );
              }
              if (item.type === "table") {
                return (
                  <div key={index} style={{ overflowX: "auto" }}>
                    <table className="cli-table">
                      <thead>
                        <tr>
                          <th>ID MONGO</th>
                          <th>NOMBRE COMPLETO</th>
                          <th>DNI</th>
                          <th>ROL CORPORATIVO</th>
                          <th>TURNO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.content.map((emp: Employee) => (
                          <tr key={emp._id}>
                            <td
                              style={{ color: "#8b949e", fontSize: "0.75rem" }}
                            >
                              {emp._id}
                            </td>
                            <td
                              style={{ color: "#ffffff", fontWeight: "bold" }}
                            >
                              {emp.fullName}
                            </td>
                            <td>{emp.dni}</td>
                            <td>{emp.corporateRole}</td>
                            <td>
                              <span
                                className={`badge-shift ${emp.shift === "Mañana" ? "shift-manana" : "shift-tarde"}`}
                              >
                                {emp.shift}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return (
                <div
                  key={index}
                  className="terminal-log-line"
                  style={{ color: "#8b949e" }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: "inherit",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {item.content}
                  </pre>
                </div>
              );
            })}
          </div>

          {/* Línea de entrada prompt CLI */}
          <form onSubmit={handleCommandSubmit} className="terminal-input-bar">
            <span className="cli-prompt-symbol">
              {user?.username}@callcenter:~$
            </span>
            <input
              type="text"
              className="cli-input-field"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Escriba un comando (ej: list, help)..."
              autoFocus
            />
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};
