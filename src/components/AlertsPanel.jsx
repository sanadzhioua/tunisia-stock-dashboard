import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function AlertsPanel({ alerts, stocks, onAdd, onRemove, onClose }) {
    const [showForm, setShowForm] = useState(false)
    const [newAlert, setNewAlert] = useState({
        symbol: '',
        targetPrice: '',
        condition: 'above'
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (newAlert.symbol && newAlert.targetPrice) {
            onAdd({
                symbol: newAlert.symbol,
                targetPrice: parseFloat(newAlert.targetPrice),
                condition: newAlert.condition
            })
            setNewAlert({ symbol: '', targetPrice: '', condition: 'above' })
            setShowForm(false)
        }
    }

    const formatNumber = (num) => {
        return num.toLocaleString('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    // Get current price for a symbol
    const getCurrentPrice = (symbol) => {
        const stock = stocks.find(s => s.symbol === symbol)
        return stock ? stock.price : null
    }

    return (
        <motion.div
            className="side-panel alerts-panel"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
        >
            <div className="panel-header">
                <h3>🔔 Alertes de Prix</h3>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="panel-content">
                {/* Add Alert Form */}
                <AnimatePresence>
                    {showForm ? (
                        <motion.form
                            className="alert-form"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handleSubmit}
                        >
                            <select
                                value={newAlert.symbol}
                                onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                                required
                            >
                                <option value="">Choisir une action</option>
                                {stocks.map(s => (
                                    <option key={s.symbol} value={s.symbol}>
                                        {s.symbol} - {s.price} TND
                                    </option>
                                ))}
                            </select>

                            <div className="alert-condition">
                                <select
                                    value={newAlert.condition}
                                    onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                                >
                                    <option value="above">Prix ≥</option>
                                    <option value="below">Prix ≤</option>
                                </select>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Prix cible"
                                    value={newAlert.targetPrice}
                                    onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                                    required
                                />
                                <span>TND</span>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Créer</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                                    Annuler
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.button
                            className="add-alert-btn"
                            onClick={() => setShowForm(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            ➕ Nouvelle alerte
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Alerts List */}
                <div className="alerts-list">
                    {alerts.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">🔕</span>
                            <p>Aucune alerte configurée</p>
                            <p className="text-muted">Créez une alerte pour être notifié</p>
                        </div>
                    ) : (
                        alerts.map(alert => {
                            const currentPrice = getCurrentPrice(alert.symbol)
                            const progress = currentPrice
                                ? alert.condition === 'above'
                                    ? Math.min((currentPrice / alert.targetPrice) * 100, 100)
                                    : Math.min((alert.targetPrice / currentPrice) * 100, 100)
                                : 0

                            return (
                                <motion.div
                                    key={alert.id}
                                    className={`alert-item ${alert.active ? 'active' : 'inactive'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    layout
                                >
                                    <div className="alert-header">
                                        <span className="alert-symbol">{alert.symbol}</span>
                                        <button
                                            className="remove-btn"
                                            onClick={() => onRemove(alert.id)}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="alert-condition-text">
                                        {alert.condition === 'above' ? 'Quand ≥' : 'Quand ≤'} {formatNumber(alert.targetPrice)} TND
                                    </div>

                                    {currentPrice && (
                                        <div className="alert-progress">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="current-price">
                                                Actuel: {formatNumber(currentPrice)} TND
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default AlertsPanel
