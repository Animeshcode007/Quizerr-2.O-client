import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext.jsx";
import { PlayerProvider } from "./contexts/PlayerContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SocketProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </SocketProvider>
  </BrowserRouter>
);
