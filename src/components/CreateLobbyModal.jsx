import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../contexts/SocketContext";
import { usePlayer } from "../contexts/PlayerContext";
import { useNavigate } from "react-router-dom";

const DUMMY_CATEGORIES = [
  "General Knowledge",
  "Movies",
  "Music",
  "Science & Nature",
  "History",
  "Sports",
]; 

const CreateLobbyModal = ({ isOpen, onClose }) => {
  const socket = useSocket();
  const { playerName } = usePlayer();
  const navigate = useNavigate();
  const [lobbyName, setLobbyName] = useState(`${playerName}'s Game`);
  const [category, setCategory] = useState(DUMMY_CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!lobbyName.trim() || !category) {
      setError("Lobby name and category are required.");
      return;
    }
    setIsLoading(true);
    setError("");

    socket.emit(
      "createLobby",
      { playerName, lobbyName, category },
      (response) => {
        setIsLoading(false);
        if (response.success) {
          onClose(); 
          navigate(`/lobby/${response.lobbyId}`); 
        } else {
          setError(response.message || "Failed to create lobby.");
        }
      }
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose} 
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-brand-primary-bg-dark p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md text-brand-text-light"
            onClick={(e) => e.stopPropagation()} 
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Create New Lobby
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="lobbyName"
                  className="block text-sm font-medium mb-1"
                >
                  Lobby Name
                </label>
                <input
                  type="text"
                  id="lobbyName"
                  value={lobbyName}
                  onChange={(e) => setLobbyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-brand-green-bright focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Fun Times Quiz"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-brand-green-bright focus:border-transparent outline-none transition-all appearance-none"
                >
                  {DUMMY_CATEGORIES.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-brand-primary-bg-dark text-brand-text-light"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-gray-600/50 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500/60 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-brand-green-bright text-white font-semibold rounded-lg shadow-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
                >
                  {isLoading ? "Creating..." : "Create Lobby"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default CreateLobbyModal;
