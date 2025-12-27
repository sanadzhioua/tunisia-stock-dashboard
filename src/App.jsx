import { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { io } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import ParticlesBackground from './components/ParticlesBackground'
import StatsCards from './components/StatsCards'
import NewsTicker from './components/NewsTicker'
import WatchlistPanel from './components/WatchlistPanel'
import AlertsPanel from './components/AlertsPanel'
import ThemeToggle from './components/ThemeToggle'
import ExportButton from './components/ExportButton'
import { SkeletonCard, SkeletonChart, SkeletonTable, SkeletonHeatmap } from './components/Skeletons'
import { useWatchlist, usePriceAlerts, useTheme, usePWA, requestNotificationPermission, showNotification } from './hooks/useLocalStorage'

// Lazy load heavy components
const StockTable = lazy(() => import('./components/StockTable'))
const LiveChart = lazy(() => import('./components/LiveChart'))
const SectorHeatMap = lazy(() => import('./components/SectorHeatMap'))
const ComparisonChart = lazy(() => import('./components/ComparisonChart'))

function App() {
    const [connected, setConnected] = useState(false)
    const [marketData, setMarketData] = useState(null)
    const [stocksData, setStocksData] = useState([])
    const [chartData, setChartData] = useState([])
    const [sectorsData, setSectorsData] = useState([])
    const [lastUpdate, setLastUpdate] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showWatchlist, setShowWatchlist] = useState(false)
    const [showAlerts, setShowAlerts] = useState(false)
    const [showComparison, setShowComparison] = useState(false)
    const [comparisonSymbols, setComparisonSymbols] = useState([])

    // Custom hooks
    const { watchlist, toggleWatchlist, isInWatchlist } = useWatchlist()
    const { alerts, addAlert, removeAlert, checkAlerts } = usePriceAlerts()
    const { isDark, toggleTheme } = useTheme()
    const { canInstall, isInstalled, isOnline, install } = usePWA()

    // Register service worker
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('✅ Service Worker registered'))
                .catch(err => console.log('❌ SW registration failed:', err))
        }

        // Request notification permission
        requestNotificationPermission()
    }, [])

    // Check alerts when stock data updates
    useEffect(() => {
        if (stocksData.length > 0) {
            const triggered = checkAlerts(stocksData)
            triggered.forEach(alert => {
                showNotification(
                    `🚨 Alerte ${alert.symbol}`,
                    `${alert.symbol} a ${alert.condition === 'above' ? 'dépassé' : 'chuté sous'} ${alert.targetPrice} TND (Actuel: ${alert.currentPrice} TND)`
                )
            })
        }
    }, [stocksData, checkAlerts])

    // Socket connection
    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        const socket = io(API_URL, {
            transports: ['websocket', 'polling']
        })

        socket.on('connect', () => {
            console.log('🔌 Connected to TunisiaStock server')
            setConnected(true)
        })

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from server')
            setConnected(false)
        })

        socket.on('market-update', (data) => {
            if (data.indices) setMarketData(data.indices)
            if (data.stocks) setStocksData(data.stocks)
            if (data.chartHistory) setChartData(data.chartHistory)
            if (data.sectors) setSectorsData(data.sectors)
            setLastUpdate(new Date())
            setLoading(false)
        })

        socket.emit('request-data')

        return () => socket.disconnect()
    }, [])

    // Fallback data fetch
    useEffect(() => {
        if (!connected && loading) {
            const fetchData = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
                    const response = await fetch(`${API_URL}/api/market`)
                    const data = await response.json()
                    if (data.indices) setMarketData(data.indices)
                    if (data.stocks) setStocksData(data.stocks)
                    if (data.chartHistory) setChartData(data.chartHistory)
                    if (data.sectors) setSectorsData(data.sectors)
                    setLastUpdate(new Date())
                    setLoading(false)
                } catch (error) {
                    console.error('Failed to fetch:', error)
                    loadDemoData()
                }
            }
            setTimeout(fetchData, 2000)
        }
    }, [connected, loading])

    const loadDemoData = useCallback(() => {
        setMarketData({
            tunindex: { value: 9847.32, change: 0.45, volume: 2340000 },
            tunindex20: { value: 4312.18, change: 0.32, volume: 1850000 }
        })

        setStocksData([
            { symbol: 'BIAT', name: 'Banque Internationale Arabe de Tunisie', price: 118.50, change: 2.35, volume: 45230, sector: 'Banques' },
            { symbol: 'SFBT', name: 'Société de Fabrication des Boissons de Tunisie', price: 21.80, change: -0.92, volume: 32100, sector: 'Agroalimentaire' },
            { symbol: 'PGH', name: 'Poulina Group Holding', price: 12.15, change: 1.65, volume: 28900, sector: 'Holding' },
            { symbol: 'STB', name: 'Société Tunisienne de Banque', price: 4.85, change: -1.22, volume: 52400, sector: 'Banques' },
            { symbol: 'ATTIJARI', name: 'Attijari Bank Tunisie', price: 42.30, change: 0.95, volume: 18700, sector: 'Banques' },
            { symbol: 'BH', name: 'Banque de l\'Habitat', price: 14.70, change: -0.68, volume: 22100, sector: 'Banques' },
            { symbol: 'ADWYA', name: 'Adwya', price: 8.95, change: 3.12, volume: 15600, sector: 'Pharma' },
            { symbol: 'SAH', name: 'SAH Lilas', price: 5.42, change: 1.88, volume: 41200, sector: 'Agroalimentaire' },
            { symbol: 'TELNET', name: 'Telnet Holding', price: 9.20, change: -2.13, volume: 8900, sector: 'Tech' },
            { symbol: 'ARTES', name: 'Automobile Réseau Tunisien', price: 6.80, change: 0.44, volume: 12300, sector: 'Distribution' }
        ])

        setSectorsData([
            { name: 'Banques', change: 0.85, volume: 138430 },
            { name: 'Agroalimentaire', change: -0.32, volume: 73300 },
            { name: 'Holding', change: 1.20, volume: 28900 },
            { name: 'Pharma', change: 2.45, volume: 15600 },
            { name: 'Tech', change: -1.50, volume: 8900 },
            { name: 'Distribution', change: 0.44, volume: 12300 }
        ])

        const history = []
        let value = 9700
        for (let i = 30; i >= 0; i--) {
            value += (Math.random() - 0.45) * 30
            history.push({
                time: new Date(Date.now() - i * 60000).toISOString(),
                value: Math.round(value * 100) / 100
            })
        }
        setChartData(history)
        setLastUpdate(new Date())
        setLoading(false)
    }, [])

    const formatTime = (date) => {
        if (!date) return '--:--:--'
        return date.toLocaleTimeString('fr-TN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const handleCompare = (symbols) => {
        setComparisonSymbols(symbols)
        setShowComparison(true)
    }

    // Get watchlist stocks
    const watchlistStocks = stocksData.filter(s => watchlist.includes(s.symbol))

    return (
        <div className={`app-container ${isDark ? 'dark' : 'light'}`}>
            {/* Particles Background */}
            <ParticlesBackground />

            {/* Header */}
            <header className="header">
                <div className="logo">
                    <svg className="logo-icon" viewBox="0 0 40 40">
                        <defs>
                            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#00f5ff" />
                                <stop offset="100%" stopColor="#ff00ff" />
                            </linearGradient>
                        </defs>
                        <rect x="2" y="10" width="36" height="20" rx="3" fill="none" stroke="url(#logoGrad)" strokeWidth="2" />
                        <polyline points="6,25 12,18 18,22 24,12 30,17 36,10" fill="none" stroke="#00f5ff" strokeWidth="2" />
                    </svg>
                    <span className="logo-text">TunisiaStock</span>
                    {!isOnline && <span className="offline-badge">OFFLINE</span>}
                </div>

                <div className="header-actions">
                    {canInstall && (
                        <button className="header-btn" onClick={install} title="Installer l'app">
                            📲 Installer
                        </button>
                    )}
                    <button
                        className={`header-btn ${showWatchlist ? 'active' : ''}`}
                        onClick={() => setShowWatchlist(!showWatchlist)}
                    >
                        ⭐ Watchlist ({watchlist.length})
                    </button>
                    <button
                        className={`header-btn ${showAlerts ? 'active' : ''}`}
                        onClick={() => setShowAlerts(!showAlerts)}
                    >
                        🔔 Alertes ({alerts.length})
                    </button>
                    <ExportButton stocks={stocksData} indices={marketData} />
                    <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                </div>

                <div className="status-indicator">
                    <span className={`status-dot ${connected ? '' : 'offline'}`}></span>
                    <span>{connected ? 'LIVE' : 'OFFLINE'}</span>
                    <span style={{ marginLeft: '1rem', opacity: 0.5 }}>
                        MAJ: {formatTime(lastUpdate)}
                    </span>
                </div>
            </header>

            {/* Watchlist Panel */}
            <AnimatePresence>
                {showWatchlist && (
                    <WatchlistPanel
                        stocks={watchlistStocks}
                        onRemove={toggleWatchlist}
                        onClose={() => setShowWatchlist(false)}
                        onCompare={handleCompare}
                    />
                )}
            </AnimatePresence>

            {/* Alerts Panel */}
            <AnimatePresence>
                {showAlerts && (
                    <AlertsPanel
                        alerts={alerts}
                        stocks={stocksData}
                        onAdd={addAlert}
                        onRemove={removeAlert}
                        onClose={() => setShowAlerts(false)}
                    />
                )}
            </AnimatePresence>

            {/* Comparison Modal */}
            <AnimatePresence>
                {showComparison && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowComparison(false)}
                    >
                        <motion.div
                            className="modal-content large"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>📊 Comparaison</h3>
                                <button onClick={() => setShowComparison(false)}>✕</button>
                            </div>
                            <Suspense fallback={<SkeletonChart />}>
                                <ComparisonChart
                                    symbols={comparisonSymbols}
                                    stocks={stocksData}
                                />
                            </Suspense>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* News Ticker */}
            <NewsTicker stocks={stocksData} />

            {/* Main Content */}
            <main className="main-content">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Skeleton Loaders */}
                            <div className="stats-grid">
                                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                            <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
                                <div className="card" style={{ gridColumn: 'span 2' }}>
                                    <SkeletonChart />
                                </div>
                                <div className="card">
                                    <SkeletonHeatmap />
                                </div>
                            </div>
                            <div className="card" style={{ marginTop: '1.5rem' }}>
                                <SkeletonTable />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Stats Cards */}
                            <StatsCards data={marketData} />

                            {/* Dashboard Grid */}
                            <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
                                {/* Live Chart */}
                                <div className="card" style={{ gridColumn: 'span 2' }}>
                                    <div className="card-header">
                                        <span className="card-title">📈 TunIndex - Évolution Temps Réel</span>
                                    </div>
                                    <Suspense fallback={<SkeletonChart />}>
                                        <LiveChart data={chartData} />
                                    </Suspense>
                                </div>

                                {/* Sector Heat Map */}
                                <div className="card">
                                    <div className="card-header">
                                        <span className="card-title">🔥 Performance par Secteur</span>
                                    </div>
                                    <Suspense fallback={<SkeletonHeatmap />}>
                                        <SectorHeatMap sectors={sectorsData} />
                                    </Suspense>
                                </div>
                            </div>

                            {/* Stock Table */}
                            <div className="card full-width" style={{ marginTop: '1.5rem' }}>
                                <div className="card-header">
                                    <span className="card-title">📊 Cotations en Direct</span>
                                    <span className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
                                        {stocksData.length} valeurs
                                    </span>
                                </div>
                                <Suspense fallback={<SkeletonTable />}>
                                    <StockTable
                                        stocks={stocksData}
                                        watchlist={watchlist}
                                        onToggleWatchlist={toggleWatchlist}
                                        onCompare={handleCompare}
                                    />
                                </Suspense>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>TunisiaStock Dashboard © 2024 | Données fournies par la Bourse de Tunis</p>
                <p style={{ marginTop: '0.25rem', opacity: 0.5 }}>
                    Les cours sont présentés avec un différé de 15 minutes
                    {isInstalled && ' • 📱 App installée'}
                </p>
            </footer>
        </div>
    )
}

export default App
