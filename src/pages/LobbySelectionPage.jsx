import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { usePlayer } from "../contexts/PlayerContext";
import CreateLobbyModal from "../components/CreateLobbyModal";
import LobbyCard from "../components/LobbyCard";
import { FaPlusCircle, FaSync } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const LobbySelectionPage = () => {
  const socket = useSocket();
  const { playerName } = usePlayer();
  const navigate = useNavigate();

  const [lobbies, setLobbies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLobbies = useCallback(() => {
    setIsLoading(true);
    setError("");
    socket.emit("getLobbies", (response) => {
      setIsLoading(false);
      if (response && Array.isArray(response)) {
        setLobbies(response);
      } else if (response && response.error) {
        setError(response.error);
        setLobbies([]);
      } else {
        setError("Failed to fetch lobbies or unexpected response.");
        setLobbies([]);
      }
    });
  }, [socket]);

  useEffect(() => {
    if (!playerName) {
      navigate("/"); 
      return;
    }
    if (!socket.connected) {
      socket.connect();
    }

    fetchLobbies();

    const handleLobbiesUpdate = (updatedLobbies) => {
      setLobbies(updatedLobbies);
    };
    const handleConnect = () => {
      console.log("Socket reconnected, fetching lobbies...");
      fetchLobbies();
    };

    socket.on("lobbiesListUpdate", handleLobbiesUpdate);
    socket.on("connect", handleConnect); 

    return () => {
      socket.off("lobbiesListUpdate", handleLobbiesUpdate);
      socket.off("connect", handleConnect);
    };
  }, [socket, playerName, navigate, fetchLobbies]);

  const handleJoinLobby = (lobbyId) => {
    if (!playerName) {
      alert("Please set your player name first (this shouldn't happen).");
      navigate("/");
      return;
    }
    socket.emit("joinLobby", { lobbyId, playerName }, (response) => {
      if (response.success) {
        navigate(`/lobby/${lobbyId}`);
      } else {
        alert(response.message || "Failed to join lobby.");
      }
    });
  };

  return (
    <div className="flex flex-col flex-grow p-4 md:p-8 bg-gradient-primary text-brand-text-light">
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold">
          Available Lobbies
        </h1>
        <div className="flex gap-3">
          <button
            onClick={fetchLobbies}
            disabled={isLoading}
            className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center"
          >
            <FaSync className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />{" "}
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-brand-green-bright hover:bg-green-500 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center"
          >
            <FaPlusCircle className="mr-2" /> Create Lobby
          </button>
        </div>
      </header>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green-bright"></div>
          <p className="ml-3 text-lg">Loading Lobbies...</p>
        </div>
      )}
      {error && (
        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">
          {error}
        </p>
      )}

      {!isLoading && !error && lobbies.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-10 text-gray-400"
        >
          <p className="text-xl mb-2">No active lobbies right now.</p>
          <p>Why not create one and invite some friends?</p>
          <p className="mt-4 text-brand-text-light/80">
            You can play alone too by just creating the lobby.
          </p>
        </motion.div>
      )}

      {!isLoading && !error && lobbies.length > 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {lobbies.map((lobby) => (
              <LobbyCard
                key={lobby.id}
                lobby={lobby}
                onJoin={handleJoinLobby}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <CreateLobbyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default LobbySelectionPage;