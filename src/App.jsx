import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LobbySelectionPage from "./pages/LobbySelectionPage";
import LobbyWaitRoomPage from "./pages/LobbyWaitRoomPage";
import GamePage from "./pages/GamePage";
import { useEffect } from "react";
import { useSocket } from "./contexts/SocketContext";
import { usePlayer } from "./contexts/PlayerContext";

function App() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { playerName, setPlayerName } = usePlayer();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
    socket.on("error", (data) => {
      console.error("Server Error (via socket):", data.message);
      alert(`Error: ${data.message}`);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("error");
    };
  }, [socket, navigate]);
  useEffect(() => {
    const currentPath = window.location.pathname;
    console.log(
      "App.jsx redirect check: playerName=",
      playerName,
      "path=",
      currentPath
    );
    if (!playerName && currentPath !== "/") {
      console.log("No player name, redirecting to landing page.");
      navigate("/");
    }
  }, [playerName, navigate, window.location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-primary">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lobbies" element={<LobbySelectionPage />} />
        <Route path="/lobby/:lobbyId" element={<LobbyWaitRoomPage />} />
        <Route path="/game/:lobbyId" element={<GamePage />} />
        <Route
          path="*"
          element={
            <div className="flex-grow flex flex-col items-center justify-center text-brand-text-light">
              <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-6 py-2 bg-brand-green-bright rounded-lg"
              >
                Go Home
              </button>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
export default App;
