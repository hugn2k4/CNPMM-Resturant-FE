import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { GlobalProvider } from "./contexts/GlobalProvider.tsx";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import "./index.css";
import router from "./routers/routes.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalProvider>
      <NotificationProvider>
        <SnackbarProvider>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </NotificationProvider>
    </GlobalProvider>
  </StrictMode>
);
