import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function StatsCards({ data }) {
    const [animatedValues, setAnimatedValues] = useState({
        tunindex: 0,
        tunindex20: 0,
        volume: 0
    })

    useEffect(() => {
        if (data) {
            // Animate numbers
            const duration = 1000
            const steps = 30
            const interval = duration / steps

            let step = 0
            const timer = setInterval(() => {
                step++
                const progress = step / steps

                setAnimatedValues({
                    tunindex: data.tunindex?.value * progress || 0,
                    tunindex20: data.tunindex20?.value * progress || 0,
                    volume: (data.tunindex?.volume || 0) * progress
                })

                if (step >= steps) {
                    clearInterval(timer)
                    setAnimatedValues({
                        tunindex: data.tunindex?.value || 0,
                        tunindex20: data.tunindex20?.value || 0,
                        volume: data.tunindex?.volume || 0
                    })
                }
            }, interval)

            return () => clearInterval(timer)
        }
    }, [data])

    const formatNumber = (num, decimals = 2) => {
        return num.toLocaleString('fr-TN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })
    }

    const formatVolume = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
        return num.toString()
    }

    const cards = [
        {
            label: 'TUNINDEX',
            value: animatedValues.tunindex,
            change: data?.tunindex?.change || 0,
            icon: '📊'
        },
        {
            label: 'TUNINDEX 20',
            value: animatedValues.tunindex20,
            change: data?.tunindex20?.change || 0,
            icon: '📈'
        },
        {
            label: 'Volume Total',
            value: animatedValues.volume,
            isVolume: true,
            icon: '💹'
        },
        {
            label: 'Statut',
            value: 'OUVERT',
            isStatus: true,
            icon: '🟢'
        }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    }

    return (
        <motion.div
            className="stats-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {cards.map((card, index) => (
                <motion.div
                    key={card.label}
                    className="stat-card"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="stat-label">
                        <span style={{ marginRight: '0.5rem' }}>{card.icon}</span>
                        {card.label}
                    </div>

                    {card.isStatus ? (
                        <div className="stat-value" style={{ color: 'var(--neon-green)' }}>
                            {card.value}
                        </div>
                    ) : card.isVolume ? (
                        <div className="stat-value">
                            {formatVolume(card.value)}
                            <span style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-muted)',
                                marginLeft: '0.25rem'
                            }}>
                                TND
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className={`stat-value ${card.change >= 0 ? 'positive' : 'negative'}`}>
                                {formatNumber(card.value)}
                            </div>
                            <div className={`stat-change ${card.change >= 0 ? 'positive' : 'negative'}`}>
                                <span>{card.change >= 0 ? '▲' : '▼'}</span>
                                <span>{card.change >= 0 ? '+' : ''}{formatNumber(card.change)}%</span>
                            </div>
                        </>
                    )}
                </motion.div>
            ))}
        </motion.div>
    )
}

export default StatsCards
