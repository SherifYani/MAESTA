import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import "./i18n/config"; // Initialize i18n

import App from "./App";
import { ProfileProvider } from "./context/ProfileContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <ProfileProvider>
          <SubscriptionProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </SubscriptionProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
