import { motion } from 'framer-motion'

function WatchlistPanel({ stocks, onRemove, onClose, onCompare }) {
    const formatNumber = (num, decimals = 2) => {
        return num.toLocaleString('fr-TN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })
    }

    return (
        <motion.div
            className="side-panel"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
        >
            <div className="panel-header">
                <h3>⭐ Ma Watchlist</h3>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="panel-content">
                {stocks.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📋</span>
                        <p>Votre watchlist est vide</p>
                        <p className="text-muted">Cliquez sur ⭐ pour ajouter des actions</p>
                    </div>
                ) : (
                    <>
                        <div className="watchlist-items">
                            {stocks.map(stock => (
                                <motion.div
                                    key={stock.symbol}
                                    className="watchlist-item"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    layout
                                >
                                    <div className="watchlist-info">
                                        <span className="watchlist-symbol">{stock.symbol}</span>
                                        <span className="watchlist-name">{stock.name}</span>
                                    </div>
                                    <div className="watchlist-data">
                                        <span className="watchlist-price">{formatNumber(stock.price)} TND</span>
                                        <span className={`watchlist-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                                            {stock.change >= 0 ? '▲' : '▼'} {formatNumber(stock.change)}%
                                        </span>
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={() => onRemove(stock.symbol)}
                                        title="Retirer de la watchlist"
                                    >
                                        ✕
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {stocks.length >= 2 && (
                            <button
                                className="compare-btn"
                                onClick={() => onCompare(stocks.map(s => s.symbol))}
                            >
                                📊 Comparer ({stocks.length} actions)
                            </button>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    )
}

export default WatchlistPanel
