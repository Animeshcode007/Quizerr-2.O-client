import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "../contexts/PlayerContext";
import PlayerListItem from "../components/PlayerListItem";
import {
  FaPlay,
  FaSignOutAlt,
  FaCog,
  FaCopy,
  FaShareAlt,
  FaUserCircle,
} from "react-icons/fa";

const LobbyWaitRoomPage = () => {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { playerName } = usePlayer();

  const [lobbyDetails, setLobbyDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const amIHost = lobbyDetails?.host?.id === socket.id;

  const handleLobbyUpdate = useCallback(
    (updatedLobbyDetails) => {
      if (updatedLobbyDetails && updatedLobbyDetails.id === lobbyId) {
        setLobbyDetails(updatedLobbyDetails);
      } else if (!updatedLobbyDetails && lobbyDetails) {
        console.log("Lobby details became null, possibly deleted.");
        setError("This lobby no longer exists.");
      }
    },
    [lobbyId, lobbyDetails]
  );

  useEffect(() => {
    if (!playerName || !lobbyId) {
      navigate("/");
      return;
    }
    if (!socket.connected) socket.connect();

    const onPlayerJoined = ({ player, lobbyDetails: updatedLobby }) => {
      console.log("Player joined:", player.name);
      handleLobbyUpdate(updatedLobby);
    };
    const onPlayerLeft = ({
      playerId,
      playerName: leftPlayerName,
      lobbyDetails: updatedLobby,
    }) => {
      console.log("Player left:", leftPlayerName || playerId);
      handleLobbyUpdate(updatedLobby);
      if (playerId === socket.id) {
        navigate("/lobbies", {
          state: { message: "You have left the lobby." },
        });
      }
    };
    const onNewHost = ({ host, lobbyDetails: updatedLobby }) => {
      console.log("New host:", host.name);
      handleLobbyUpdate(updatedLobby);
    };
    const onGameStarted = (gameStartData) => {
      console.log("Game is starting!", gameStartData);
      navigate(`/game/${lobbyId}`);
    };
    const onKicked = ({ message }) => {
      alert(message || "You have been removed from the lobby.");
      navigate("/lobbies");
    };
    const onLobbyClosed = () => {
      alert("The lobby has been closed.");
      navigate("/lobbies");
    };
    socket.on("playerJoined", onPlayerJoined);
    socket.on("playerLeft", onPlayerLeft);
    socket.on("newHost", onNewHost);
    socket.on("gameStarted", onGameStarted);
    socket.on("kicked", onKicked);
    socket.on("lobbyClosed", onLobbyClosed);

    if (!lobbyDetails) {
      socket.emit("joinLobby", { lobbyId, playerName }, (response) => {
        setIsLoading(false);
        if (response.success) {
          setLobbyDetails(response.lobbyDetails);
        } else {
          setError(
            response.message ||
              "Could not load lobby details. It might not exist or you were removed."
          );
          setTimeout(() => navigate("/lobbies"), 3000);
        }
      });
    } else {
      setIsLoading(false);
    }

    return () => {
      socket.off("playerJoined", onPlayerJoined);
      socket.off("playerLeft", onPlayerLeft);
      socket.off("newHost", onNewHost);
      socket.off("gameStarted", onGameStarted);
      socket.off("kicked", onKicked);
      socket.off("lobbyClosed", onLobbyClosed);
    };
  }, [socket, lobbyId, playerName, navigate, handleLobbyUpdate, lobbyDetails]);

  const handleLeaveLobby = () => {
    socket.emit("leaveLobby", { lobbyId }, (response) => {
      if (response.success) {
        navigate("/lobbies");
      } else {
        alert(response.message || "Failed to leave lobby.");
      }
    });
  };

  const handleStartGame = () => {
    if (!amIHost) return;
    socket.emit("startGame", { lobbyId }, (response) => {
      if (response?.success) {
        console.log(
          "Start game request successful, waiting for gameStarted event."
        );
      } else {
        alert(response?.message || "Failed to start game.");
      }
    });
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/lobbies?join=${lobbyId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy invite link: ", err);
        alert(
          "Failed to copy link. Please copy it manually from the address bar."
        );
      });
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gradient-primary text-brand-text-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green-bright"></div>
        <p className="mt-3 text-lg">Loading Lobby...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gradient-primary text-brand-text-light">
        <p className="text-xl text-red-400">{error}</p>
        <button
          onClick={() => navigate("/lobbies")}
          className="mt-4 px-6 py-2 bg-brand-green-bright text-white rounded-lg"
        >
          Back to Lobbies
        </button>
      </div>
    );
  }

  if (!lobbyDetails) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        Lobby details not found. Redirecting...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-grow flex flex-col md:flex-row p-4 md:p-8 gap-6 md:gap-8 bg-gradient-primary text-brand-text-light"
    >
      <div className="md:w-2/3 lg:w-3/4 bg-white/5 p-5 md:p-7 rounded-xl shadow-xl flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold truncate mb-1">
            {lobbyDetails.name}
          </h1>
          <p className="text-sm text-gray-400">
            Category: {lobbyDetails.settings.category} • Waiting for players...
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-3">
          Players ({lobbyDetails.players.length}/
          {lobbyDetails.settings.maxPlayers})
        </h2>
        <ul className="space-y-2 flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {" "}
          <AnimatePresence>
            {lobbyDetails.players.map((player) => (
              <PlayerListItem
                key={player.id}
                player={player}
                isHost={player.id === lobbyDetails.host.id}
              />
            ))}
          </AnimatePresence>
        </ul>
        <div className="mt-auto pt-6 border-t border-white/10">
          <button
            onClick={copyInviteLink}
            className="w-full mb-3 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center"
            title="Copy invite link"
          >
            <FaShareAlt className="mr-2" />{" "}
            {copied ? "Link Copied!" : "Copy Invite Link"}
          </button>
          <button
            onClick={handleLeaveLobby}
            className="w-full px-5 py-3 bg-red-600/80 hover:bg-red-700/80 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center"
          >
            <FaSignOutAlt className="mr-2" /> Leave Lobby
          </button>
        </div>
      </div>

      <div className="md:w-1/3 lg:w-1/4 bg-white/5 p-5 md:p-7 rounded-xl shadow-xl flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-4">Lobby Host</h2>
          <div className="flex items-center p-3 bg-white/10 rounded-lg mb-6">
            <FaUserCircle className="text-3xl mr-3 text-brand-green-bright" />
            <div>
              <p className="font-medium">{lobbyDetails.host.name}</p>
              <p className="text-xs text-gray-400">Controls the game</p>
            </div>
          </div>

          {amIHost && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Host Controls</h3>
              <button
                className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center text-gray-400 cursor-not-allowed"
                disabled
              >
                <FaCog className="mr-2" /> Lobby Settings (Soon)
              </button>
            </div>
          )}
        </div>

        {amIHost && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartGame}
            className={`w-full px-6 py-4 bg-brand-green-bright text-white text-lg font-bold rounded-lg shadow-xl hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-600 transition-all flex items-center justify-center
                            ${
                              lobbyDetails.players.length < 1
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            } `}
          >
            <FaPlay className="mr-2" /> Start Game
          </motion.button>
        )}
        {!amIHost && (
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <p className="font-semibold">
              Waiting for{" "}
              <span className="text-brand-green-bright">
                {lobbyDetails.host.name}
              </span>{" "}
              to start the game.
            </p>
            <div className="mt-3 animate-pulse">Patience, young Padawan...</div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LobbyWaitRoomPage;
