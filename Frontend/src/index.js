import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";

import App from "./App";
import ThemeToggle from "./components/common/ThemeToggle";
import { ProfileProvider } from "./context/ProfileContext";
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
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </BrowserRouter>
  </React.StrictMode>
);
