import { motion } from 'framer-motion'

function ThemeToggle({ isDark, onToggle }) {
    return (
        <motion.button
            className="theme-toggle"
            onClick={onToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
        >
            <motion.div
                className="toggle-track"
                animate={{
                    backgroundColor: isDark ? 'rgba(0, 245, 255, 0.2)' : 'rgba(255, 200, 100, 0.3)'
                }}
            >
                <motion.div
                    className="toggle-thumb"
                    animate={{
                        x: isDark ? 0 : 24,
                        backgroundColor: isDark ? '#00f5ff' : '#ffc864'
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    <span className="toggle-icon">{isDark ? '🌙' : '☀️'}</span>
                </motion.div>
            </motion.div>
        </motion.button>
    )
}

export default ThemeToggle
