import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import ThemeToggle from "./components/common/ThemeToggle";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeToggle />
        <App />
    </React.StrictMode>
);
