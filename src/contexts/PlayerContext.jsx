import React, { createContext, useContext, useState } from "react";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("quizzerPlayerName") || "" // Persist name
  );

  const updatePlayerName = (name) => {
    setPlayerName(name);
    localStorage.setItem("quizzerPlayerName", name);
  };

  return (
    <PlayerContext.Provider
      value={{ playerName, setPlayerName: updatePlayerName }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
