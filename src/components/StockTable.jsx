import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVirtualizer } from '@tanstack/react-virtual'

function StockTable({ stocks, watchlist = [], onToggleWatchlist, onCompare }) {
    const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' })
    const [filter, setFilter] = useState('')
    const [selectedStocks, setSelectedStocks] = useState([])
    const parentRef = useRef(null)

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const filteredAndSortedStocks = useMemo(() => {
        let result = [...stocks]

        // Filter
        if (filter) {
            const lowerFilter = filter.toLowerCase()
            result = result.filter(stock =>
                stock.symbol.toLowerCase().includes(lowerFilter) ||
                stock.name.toLowerCase().includes(lowerFilter) ||
                stock.sector?.toLowerCase().includes(lowerFilter)
            )
        }

        // Sort
        result.sort((a, b) => {
            let aVal = a[sortConfig.key]
            let bVal = b[sortConfig.key]

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase()
                bVal = bVal.toLowerCase()
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })

        return result
    }, [stocks, sortConfig, filter])

    // Virtualization for large lists
    const rowVirtualizer = useVirtualizer({
        count: filteredAndSortedStocks.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50,
        overscan: 5
    })

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

    const isInWatchlist = (symbol) => watchlist.includes(symbol)

    const toggleSelection = (symbol) => {
        setSelectedStocks(prev =>
            prev.includes(symbol)
                ? prev.filter(s => s !== symbol)
                : prev.length < 5 ? [...prev, symbol] : prev
        )
    }

    const columns = [
        { key: 'watchlist', label: '⭐', width: '40px' },
        { key: 'symbol', label: 'Symbole' },
        { key: 'name', label: 'Société' },
        { key: 'price', label: 'Cours (TND)' },
        { key: 'change', label: 'Variation' },
        { key: 'volume', label: 'Volume' },
        { key: 'sector', label: 'Secteur' }
    ]

    return (
        <div className="stock-table-container">
            {/* Controls */}
            <div style={{
                marginBottom: '1rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <input
                    type="text"
                    placeholder="🔍 Rechercher une valeur..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        flex: 1,
                        minWidth: '200px',
                        maxWidth: '300px',
                        padding: '0.75rem 1rem',
                        background: 'rgba(0, 245, 255, 0.05)',
                        border: '1px solid rgba(0, 245, 255, 0.3)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--neon-cyan)'
                        e.target.style.boxShadow = '0 0 10px rgba(0, 245, 255, 0.3)'
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 245, 255, 0.3)'
                        e.target.style.boxShadow = 'none'
                    }}
                />

                {selectedStocks.length >= 2 && onCompare && (
                    <motion.button
                        className="compare-btn"
                        onClick={() => onCompare(selectedStocks)}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ margin: 0, padding: '0.5rem 1rem' }}
                    >
                        📊 Comparer ({selectedStocks.length})
                    </motion.button>
                )}

                <span className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
                    {filteredAndSortedStocks.length} valeurs
                </span>
            </div>

            {/* Virtualized Table */}
            <div
                ref={parentRef}
                style={{
                    height: '400px',
                    overflow: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--neon-cyan) var(--bg-darker)'
                }}
            >
                <table className="stock-table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => col.key !== 'watchlist' && handleSort(col.key)}
                                    className={sortConfig.key === col.key ? `sorted ${sortConfig.direction}` : ''}
                                    style={col.width ? { width: col.width } : {}}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ height: `${rowVirtualizer.getTotalSize()}px`, display: 'table-row' }}>
                            <td colSpan={columns.length} style={{ padding: 0, position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
                                    {rowVirtualizer.getVirtualItems().map(virtualRow => {
                                        const stock = filteredAndSortedStocks[virtualRow.index]
                                        const isSelected = selectedStocks.includes(stock.symbol)

                                        return (
                                            <motion.div
                                                key={stock.symbol}
                                                data-index={virtualRow.index}
                                                ref={rowVirtualizer.measureElement}
                                                className={`virtual-row ${isSelected ? 'selected' : ''}`}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '50px',
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                    display: 'grid',
                                                    gridTemplateColumns: '40px 1fr 2fr 1fr 1fr 1fr 1fr',
                                                    alignItems: 'center',
                                                    padding: '0 1rem',
                                                    borderBottom: '1px solid var(--border-subtle)',
                                                    background: isSelected ? 'rgba(0, 245, 255, 0.1)' : 'transparent',
                                                    transition: 'background 0.2s ease'
                                                }}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                whileHover={{ background: 'rgba(0, 245, 255, 0.05)' }}
                                                onClick={() => toggleSelection(stock.symbol)}
                                            >
                                                {/* Watchlist Button */}
                                                <button
                                                    className={`watchlist-btn ${isInWatchlist(stock.symbol) ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onToggleWatchlist?.(stock.symbol)
                                                    }}
                                                    title={isInWatchlist(stock.symbol) ? 'Retirer de la watchlist' : 'Ajouter à la watchlist'}
                                                >
                                                    {isInWatchlist(stock.symbol) ? '⭐' : '☆'}
                                                </button>

                                                {/* Symbol */}
                                                <span className="stock-symbol">{stock.symbol}</span>

                                                {/* Name */}
                                                <span className="stock-name" style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {stock.name}
                                                </span>

                                                {/* Price */}
                                                <span className="stock-price">{formatNumber(stock.price)}</span>

                                                {/* Change */}
                                                <span className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                                                    {stock.change >= 0 ? '▲' : '▼'} {stock.change >= 0 ? '+' : ''}{formatNumber(stock.change)}%
                                                </span>

                                                {/* Volume */}
                                                <span className="stock-volume">{formatVolume(stock.volume)}</span>

                                                {/* Sector */}
                                                <span style={{ color: 'var(--neon-purple)', fontSize: '0.8rem' }}>
                                                    {stock.sector || '-'}
                                                </span>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {filteredAndSortedStocks.length === 0 && (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)'
                }}>
                    Aucune valeur trouvée
                </div>
            )}

            {/* Selection hint */}
            {selectedStocks.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(0, 245, 255, 0.1)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)'
                    }}
                >
                    {selectedStocks.length} action(s) sélectionnée(s) - Cliquez sur "Comparer" pour voir les graphiques
                    <button
                        onClick={() => setSelectedStocks([])}
                        style={{
                            marginLeft: '1rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--neon-magenta)',
                            cursor: 'pointer'
                        }}
                    >
                        Annuler
                    </button>
                </motion.div>
            )}
        </div>
    )
}

export default StockTable
