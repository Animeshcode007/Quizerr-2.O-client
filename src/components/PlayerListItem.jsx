import React from 'react';
import { FaUserCircle, FaCrown } from 'react-icons/fa'; 
import { motion } from 'framer-motion';

const PlayerListItem = ({ player, isHost }) => {
    return (
        <motion.li
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-md mb-2 shadow"
        >
            <div className="flex items-center">
                <FaUserCircle className="text-2xl mr-3 text-gray-400" />
                <span className="text-brand-text-light font-medium">{player.name}</span>
            </div>
            {isHost && <FaCrown className="text-xl text-yellow-400" title="Host" />}
        </motion.li>
    );
};

export default PlayerListItem;