import { useState, useEffect, useCallback } from 'react'

// Local storage keys
const WATCHLIST_KEY = 'tunisiastock_watchlist'
const ALERTS_KEY = 'tunisiastock_alerts'
const THEME_KEY = 'tunisiastock_theme'

/**
 * Hook for managing watchlist
 */
export function useWatchlist() {
    const [watchlist, setWatchlist] = useState(() => {
        const saved = localStorage.getItem(WATCHLIST_KEY)
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist))
    }, [watchlist])

    const addToWatchlist = useCallback((symbol) => {
        setWatchlist(prev => {
            if (prev.includes(symbol)) return prev
            return [...prev, symbol]
        })
    }, [])

    const removeFromWatchlist = useCallback((symbol) => {
        setWatchlist(prev => prev.filter(s => s !== symbol))
    }, [])

    const isInWatchlist = useCallback((symbol) => {
        return watchlist.includes(symbol)
    }, [watchlist])

    const toggleWatchlist = useCallback((symbol) => {
        if (isInWatchlist(symbol)) {
            removeFromWatchlist(symbol)
        } else {
            addToWatchlist(symbol)
        }
    }, [isInWatchlist, addToWatchlist, removeFromWatchlist])

    return {
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        toggleWatchlist,
        clearWatchlist: () => setWatchlist([])
    }
}

/**
 * Hook for managing price alerts
 */
export function usePriceAlerts() {
    const [alerts, setAlerts] = useState(() => {
        const saved = localStorage.getItem(ALERTS_KEY)
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
    }, [alerts])

    const addAlert = useCallback((alert) => {
        const newAlert = {
            id: Date.now().toString(),
            symbol: alert.symbol,
            targetPrice: alert.targetPrice,
            condition: alert.condition, // 'above' or 'below'
            active: true,
            createdAt: new Date().toISOString()
        }
        setAlerts(prev => [...prev, newAlert])
        return newAlert
    }, [])

    const removeAlert = useCallback((alertId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId))
    }, [])

    const toggleAlert = useCallback((alertId) => {
        setAlerts(prev => prev.map(a =>
            a.id === alertId ? { ...a, active: !a.active } : a
        ))
    }, [])

    const checkAlerts = useCallback((stocks) => {
        const triggeredAlerts = []

        alerts.forEach(alert => {
            if (!alert.active) return

            const stock = stocks.find(s => s.symbol === alert.symbol)
            if (!stock) return

            const triggered = alert.condition === 'above'
                ? stock.price >= alert.targetPrice
                : stock.price <= alert.targetPrice

            if (triggered) {
                triggeredAlerts.push({
                    ...alert,
                    currentPrice: stock.price
                })
            }
        })

        return triggeredAlerts
    }, [alerts])

    return {
        alerts,
        addAlert,
        removeAlert,
        toggleAlert,
        checkAlerts,
        clearAlerts: () => setAlerts([])
    }
}

/**
 * Hook for theme management
 */
export function useTheme() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem(THEME_KEY)
        return saved !== null ? JSON.parse(saved) : true // Default dark
    })

    useEffect(() => {
        localStorage.setItem(THEME_KEY, JSON.stringify(isDark))
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    }, [isDark])

    const toggleTheme = useCallback(() => {
        setIsDark(prev => !prev)
    }, [])

    return { isDark, toggleTheme, setTheme: setIsDark }
}

/**
 * Hook for PWA installation
 */
export function usePWA() {
    const [installPrompt, setInstallPrompt] = useState(null)
    const [isInstalled, setIsInstalled] = useState(false)
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
        }

        // Capture install prompt
        const handleBeforeInstall = (e) => {
            e.preventDefault()
            setInstallPrompt(e)
        }

        // Handle app installed
        const handleInstalled = () => {
            setIsInstalled(true)
            setInstallPrompt(null)
        }

        // Handle online/offline
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)
        window.addEventListener('appinstalled', handleInstalled)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            window.removeEventListener('appinstalled', handleInstalled)
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const install = useCallback(async () => {
        if (!installPrompt) return false

        installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice

        if (outcome === 'accepted') {
            setIsInstalled(true)
        }
        setInstallPrompt(null)

        return outcome === 'accepted'
    }, [installPrompt])

    return {
        canInstall: !!installPrompt,
        isInstalled,
        isOnline,
        install
    }
}

/**
 * Hook for stock history (for comparison charts)
 */
export function useStockHistory() {
    const [history, setHistory] = useState({})

    const addDataPoint = useCallback((symbol, data) => {
        setHistory(prev => {
            const stockHistory = prev[symbol] || []
            const newHistory = [...stockHistory, { ...data, timestamp: Date.now() }]
            // Keep last 100 points per stock
            return {
                ...prev,
                [symbol]: newHistory.slice(-100)
            }
        })
    }, [])

    const getHistory = useCallback((symbol, period = '1D') => {
        const stockHistory = history[symbol] || []
        const now = Date.now()

        const periods = {
            '1D': 24 * 60 * 60 * 1000,
            '1W': 7 * 24 * 60 * 60 * 1000,
            '1M': 30 * 24 * 60 * 60 * 1000,
            '1Y': 365 * 24 * 60 * 60 * 1000
        }

        const cutoff = now - (periods[period] || periods['1D'])
        return stockHistory.filter(h => h.timestamp >= cutoff)
    }, [history])

    return { history, addDataPoint, getHistory }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Notifications not supported')
        return false
    }

    if (Notification.permission === 'granted') {
        return true
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
    }

    return false
}

/**
 * Show notification
 */
export function showNotification(title, body, options = {}) {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            vibrate: [200, 100, 200],
            ...options
        })

        notification.onclick = () => {
            window.focus()
            notification.close()
        }

        return notification
    }
}
