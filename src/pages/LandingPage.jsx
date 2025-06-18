import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";
import { useSocket } from "../contexts/SocketContext";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();
  const { playerName, setPlayerName } = usePlayer();
  const socket = useSocket();
  const [currentName, setCurrentName] = useState(playerName || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (playerName) {
      setCurrentName(playerName);
    }
  }, [playerName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const trimmedName = currentName.trim();

    if (!trimmedName) {
      setError("Please enter your name!");
      return;
    }
    if (trimmedName.length > 20) {
      setError("Name is too long (max 20 characters).");
      return;
    }

    setPlayerName(trimmedName);

    if (!socket.connected) {
      socket.connect();
    }
    navigate("/lobbies");
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow text-center px-4 py-20 bg-gradient-primary">
      <header className="absolute top-6 left-6 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-brand-green-bright text-white font-bold text-lg md:text-xl px-4 py-2 rounded-md shadow-lg">
            QUIZERR 2.0
          </div>
        </motion.div>
      </header>

      <main className="space-y-10 md:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight space-y-2 md:space-y-3"
        >
          <p>
            <span className="text-brand-red">LIVE</span>
            <span className="text-brand-text-light ml-2 sm:ml-3">QUIZZES</span>
          </p>
          <p>
            <span className="text-brand-green-bright">REAL</span>
            <span className="text-brand-text-light ml-2 sm:ml-3">RIVALS</span>
          </p>
          <p>
            <span className="text-brand-yellow">INSTANT</span>
            <span className="text-brand-text-light ml-2 sm:ml-3">GLORY</span>
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm mx-auto space-y-5"
        >
          <p className="text-lg md:text-xl text-brand-text-light font-medium">
            Just enter your name to get started
          </p>
          <input
            type="text"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            placeholder="Your Awesome Name"
            className="w-full px-5 py-3 text-brand-text-dark bg-white border-2 border-transparent rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-green-bright/70 focus:border-transparent transition-all placeholder-gray-400"
            required
            maxLength={20}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-brand-green-bright text-white font-semibold text-lg rounded-full shadow-md hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-600 focus:ring-opacity-50 transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95"
          >
            Let's Go!
          </button>
        </motion.form>
      </main>

      <footer className="py-8 mt-auto">
        <p className="text-xs text-gray-400">© 2023 Quizerr Masters</p>
        <p className="text-xs text-gray-400 mt-1 mb-2">
          {" "}
          {/* Added mb-2 for spacing before icons */}
          Crafted with{" "}
          <span role="img" aria-label="laptop computer">
            💻
          </span>{" "}
          by{" "}
          <p className="hover:text-brand-green-bright underline">{Animesh}</p>
        </p>
        <div className="flex justify-center items-center space-x-4">
          {devInfo.github && (
            <a
              href="https://github.com/Animeshcode007"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              title="GitHub"
              className="text-gray-400 hover:text-brand-green-bright transition-colors duration-150"
            >
              <FaGithub size={22} />
            </a>
          )}
          {devInfo.linkedin && (
            <a
              href="https://www.linkedin.com/in/animesh-khare-951282289/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              title="LinkedIn"
              className="text-gray-400 hover:text-brand-green-bright transition-colors duration-150"
            >
              <FaLinkedin size={22} />
            </a>
          )}
          {devInfo.instagram && (
            <a
              href="https://instagram.com/animesh_khare001"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              title="Instagram"
              className="text-gray-400 hover:text-brand-green-bright transition-colors duration-150"
            >
              <FaInstagram size={22} />
            </a>
          )}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
