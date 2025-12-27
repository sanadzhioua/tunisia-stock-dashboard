import { motion } from 'framer-motion'

function SectorHeatMap({ sectors }) {
    const getIntensity = (change) => {
        const absChange = Math.abs(change)
        if (absChange > 3) return 1
        if (absChange > 2) return 0.8
        if (absChange > 1) return 0.6
        if (absChange > 0.5) return 0.4
        return 0.2
    }

    const getClassName = (change) => {
        if (change > 0.1) return 'positive'
        if (change < -0.1) return 'negative'
        return 'neutral'
    }

    const formatChange = (change) => {
        return (change >= 0 ? '+' : '') + change.toFixed(2) + '%'
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const itemVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 200
            }
        }
    }

    // Sort by absolute change for visual impact
    const sortedSectors = [...sectors].sort((a, b) =>
        Math.abs(b.change) - Math.abs(a.change)
    )

    return (
        <motion.div
            className="heatmap-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {sortedSectors.map((sector) => (
                <motion.div
                    key={sector.name}
                    className={`heatmap-cell ${getClassName(sector.change)}`}
                    variants={itemVariants}
                    whileHover={{
                        scale: 1.08,
                        zIndex: 10,
                        boxShadow: sector.change >= 0
                            ? '0 0 20px rgba(0, 255, 136, 0.5)'
                            : '0 0 20px rgba(255, 51, 102, 0.5)'
                    }}
                    style={{
                        opacity: 0.5 + getIntensity(sector.change) * 0.5
                    }}
                >
                    <span className="heatmap-label">{sector.name}</span>
                    <span className={`heatmap-value ${getClassName(sector.change)}`}>
                        {formatChange(sector.change)}
                    </span>
                </motion.div>
            ))}
        </motion.div>
    )
}

export default SectorHeatMap
