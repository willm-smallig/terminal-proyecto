import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Home from "./pages/Home";

/* Importación del Estado Global y Guardián de Rutas */
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

/* Páginas de la app */
import { LoginPage } from "./pages/LoginPage";
import { TerminalPage } from "./pages/TerminalPage";

/* Estilos globales de Ionic y tema retro terminal */
import "@ionic/react/css/core.css";
import "./theme/terminal.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    {/* Proveedor de Autenticación */}
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Ruta pública de Inicio de Sesión */}
          <Route exact path="/login" component={LoginPage} />

          {/* Ruta protegida de la Terminal - (Solo si hay JWT activo) */}
          <ProtectedRoute exact path="/terminal">
            <TerminalPage />
          </ProtectedRoute>

          {/* Redirección por defecto a la terminal */}
          <Route exact path="/">
            <Redirect to="/terminal" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
