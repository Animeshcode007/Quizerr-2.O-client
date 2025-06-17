import React from "react";
import { FaUsers, FaTag, FaPlay, FaLock, FaUserShield } from "react-icons/fa"; // Example icons
import { motion } from "framer-motion";

const LobbyCard = ({ lobby, onJoin }) => {
  const isFull = lobby.playerCount >= lobby.maxPlayers;
  const isPlaying = lobby.status === "playing";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/10 p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between ${
        isFull || isPlaying ? "opacity-70" : ""
      }`}
    >
      <div>
        <h3 className="text-xl font-semibold mb-2 truncate text-brand-text-light">
          {lobby.name}
        </h3>
        <div className="text-sm text-gray-300 space-y-1.5 mb-3">
          <p className="flex items-center">
            <FaUserShield className="mr-2 text-brand-green-bright" />
            Host: {lobby.hostName}
          </p>
          <p className="flex items-center">
            <FaUsers className="mr-2 text-brand-green-bright" />
            Players: {lobby.playerCount} / {lobby.maxPlayers}
          </p>
          <p className="flex items-center">
            <FaTag className="mr-2 text-brand-green-bright" />
            Category: {lobby.category}
          </p>
        </div>
      </div>
      <button
        onClick={() => onJoin(lobby.id)}
        disabled={isFull || isPlaying}
        className={`w-full mt-3 px-4 py-2.5 font-semibold rounded-md transition-all duration-200 ease-in-out flex items-center justify-center
                    ${
                      isFull || isPlaying
                        ? "bg-gray-500/80 text-gray-300 cursor-not-allowed"
                        : "bg-brand-green-bright text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 active:bg-green-600 transform hover:scale-105"
                    }`}
      >
        {isPlaying ? <FaLock className="mr-2" /> : <FaPlay className="mr-2" />}
        {isFull ? "Lobby Full" : isPlaying ? "In Game" : "Join Lobby"}
      </button>
    </motion.div>
  );
};

export default LobbyCard;
