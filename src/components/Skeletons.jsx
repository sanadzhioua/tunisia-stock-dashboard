import { motion } from 'framer-motion'

export function SkeletonCard() {
    return (
        <motion.div
            className="skeleton-card"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-value"></div>
            <div className="skeleton-line skeleton-small"></div>
        </motion.div>
    )
}

export function SkeletonChart() {
    return (
        <motion.div
            className="skeleton-chart"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
            <div className="skeleton-line skeleton-title" style={{ width: '40%' }}></div>
            <div className="skeleton-chart-area">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="skeleton-bar"
                        style={{
                            height: `${30 + Math.random() * 60}%`,
                            animationDelay: `${i * 0.05}s`
                        }}
                    ></div>
                ))}
            </div>
        </motion.div>
    )
}

export function SkeletonTable() {
    return (
        <motion.div
            className="skeleton-table"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
            <div className="skeleton-row skeleton-header">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton-cell"></div>
                ))}
            </div>
            {[...Array(8)].map((_, rowIndex) => (
                <div key={rowIndex} className="skeleton-row" style={{ animationDelay: `${rowIndex * 0.1}s` }}>
                    {[...Array(6)].map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className="skeleton-cell"
                            style={{ width: colIndex === 1 ? '150px' : '80px' }}
                        ></div>
                    ))}
                </div>
            ))}
        </motion.div>
    )
}

export function SkeletonHeatmap() {
    return (
        <motion.div
            className="skeleton-heatmap"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
            <div className="heatmap-grid">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="skeleton-heatmap-cell"
                        style={{ animationDelay: `${i * 0.08}s` }}
                    ></div>
                ))}
            </div>
        </motion.div>
    )
}

export default { SkeletonCard, SkeletonChart, SkeletonTable, SkeletonHeatmap }
