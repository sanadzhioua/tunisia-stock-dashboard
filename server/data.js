// In-memory cache for market data
let marketDataCache = {
    stocks: [],
    indices: {
        tunindex: { value: 0, change: 0, volume: 0 },
        tunindex20: { value: 0, change: 0, volume: 0 }
    },
    sectors: [],
    chartHistory: [],
    lastUpdate: null
}

/**
 * Get current market data from cache
 */
export function getMarketData() {
    return { ...marketDataCache }
}

/**
 * Update market data cache
 */
export function updateMarketData(newData) {
    marketDataCache = {
        ...marketDataCache,
        ...newData,
        lastUpdate: new Date().toISOString()
    }
}

/**
 * Generate realistic demo data for the Tunisian stock market
 */
export function generateDemoData() {
    // Real Tunisian stock market companies
    const tunisianStocks = [
        { symbol: 'BIAT', name: 'Banque Internationale Arabe de Tunisie', basePrice: 118.50, sector: 'Banques' },
        { symbol: 'SFBT', name: 'Société de Fabrication des Boissons de Tunisie', basePrice: 21.80, sector: 'Agroalimentaire' },
        { symbol: 'PGH', name: 'Poulina Group Holding', basePrice: 12.15, sector: 'Holding' },
        { symbol: 'STB', name: 'Société Tunisienne de Banque', basePrice: 4.85, sector: 'Banques' },
        { symbol: 'ATTIJARI', name: 'Attijari Bank Tunisie', basePrice: 42.30, sector: 'Banques' },
        { symbol: 'BH', name: 'Banque de l\'Habitat', basePrice: 14.70, sector: 'Banques' },
        { symbol: 'ADWYA', name: 'Adwya', basePrice: 8.95, sector: 'Pharma' },
        { symbol: 'SAH', name: 'SAH Lilas', basePrice: 5.42, sector: 'Agroalimentaire' },
        { symbol: 'TELNET', name: 'Telnet Holding', basePrice: 9.20, sector: 'Tech' },
        { symbol: 'ARTES', name: 'Automobile Réseau Tunisien', basePrice: 6.80, sector: 'Distribution' },
        { symbol: 'BNA', name: 'Banque Nationale Agricole', basePrice: 8.90, sector: 'Banques' },
        { symbol: 'UIB', name: 'Union Internationale de Banques', basePrice: 22.50, sector: 'Banques' },
        { symbol: 'STAR', name: 'Société Tunisienne d\'Assurance et de Réassurance', basePrice: 135.00, sector: 'Assurance' },
        { symbol: 'DELICE', name: 'Délice Holding', basePrice: 16.20, sector: 'Agroalimentaire' },
        { symbol: 'ONE TECH', name: 'One Tech Holding', basePrice: 11.45, sector: 'Tech' },
        { symbol: 'MONOPRIX', name: 'Monoprix', basePrice: 7.90, sector: 'Distribution' },
        { symbol: 'CARTHAGE CEMENT', name: 'Carthage Cement', basePrice: 1.85, sector: 'Industrie' },
        { symbol: 'ENNAKL', name: 'Ennakl Automobiles', basePrice: 12.80, sector: 'Distribution' },
        { symbol: 'LAND\'OR', name: 'Land\'Or', basePrice: 9.35, sector: 'Agroalimentaire' },
        { symbol: 'EUROCYCLES', name: 'Euro-Cycles', basePrice: 25.60, sector: 'Industrie' },
        { symbol: 'SIPHAT', name: 'Siphat', basePrice: 4.20, sector: 'Pharma' },
        { symbol: 'TPR', name: 'TPR', basePrice: 6.15, sector: 'Industrie' },
        { symbol: 'SOTUVER', name: 'Sotuver', basePrice: 8.70, sector: 'Industrie' },
        { symbol: 'UBCI', name: 'Union Bancaire pour le Commerce et l\'Industrie', basePrice: 28.40, sector: 'Banques' },
        { symbol: 'ATB', name: 'Arab Tunisian Bank', basePrice: 3.25, sector: 'Banques' },
        { symbol: 'CITY CARS', name: 'City Cars', basePrice: 3.80, sector: 'Distribution' },
        { symbol: 'GIF', name: 'GIF Filter', basePrice: 1.95, sector: 'Industrie' },
        { symbol: 'SITS', name: 'SITS', basePrice: 2.45, sector: 'Immobilier' },
        { symbol: 'SIMPAR', name: 'Simpar', basePrice: 35.50, sector: 'Immobilier' },
        { symbol: 'SOTETEL', name: 'Sotetel', basePrice: 5.60, sector: 'Tech' }
    ]

    // Generate random variations
    const stocks = tunisianStocks.map(stock => {
        const variation = (Math.random() - 0.5) * 6 // -3% to +3%
        const price = Math.round((stock.basePrice * (1 + variation / 100)) * 100) / 100
        const change = Math.round(variation * 100) / 100
        const volume = Math.floor(Math.random() * 80000) + 5000

        return {
            symbol: stock.symbol,
            name: stock.name,
            price,
            change,
            volume,
            sector: stock.sector
        }
    })

    // Calculate sector performance
    const sectorMap = new Map()
    stocks.forEach(stock => {
        if (!sectorMap.has(stock.sector)) {
            sectorMap.set(stock.sector, { changes: [], volumes: [] })
        }
        sectorMap.get(stock.sector).changes.push(stock.change)
        sectorMap.get(stock.sector).volumes.push(stock.volume)
    })

    const sectors = Array.from(sectorMap.entries()).map(([name, data]) => ({
        name,
        change: Math.round((data.changes.reduce((a, b) => a + b, 0) / data.changes.length) * 100) / 100,
        volume: data.volumes.reduce((a, b) => a + b, 0)
    }))

    // Calculate indices from weighted stocks
    const bankStocks = stocks.filter(s => s.sector === 'Banques')
    const top20Stocks = stocks.slice(0, 20)

    const tunindexChange = Math.round((stocks.reduce((sum, s) => sum + s.change, 0) / stocks.length) * 100) / 100
    const tunindex20Change = Math.round((top20Stocks.reduce((sum, s) => sum + s.change, 0) / top20Stocks.length) * 100) / 100

    // Base TUNINDEX value around 9800
    const tunindexBase = marketDataCache.indices?.tunindex?.value || 9847
    const tunindex20Base = marketDataCache.indices?.tunindex20?.value || 4312

    const indices = {
        tunindex: {
            value: Math.round((tunindexBase * (1 + tunindexChange / 1000)) * 100) / 100,
            change: tunindexChange,
            volume: stocks.reduce((sum, s) => sum + s.volume, 0)
        },
        tunindex20: {
            value: Math.round((tunindex20Base * (1 + tunindex20Change / 1000)) * 100) / 100,
            change: tunindex20Change,
            volume: top20Stocks.reduce((sum, s) => sum + s.volume, 0)
        }
    }

    // Generate chart history (last 30 minutes)
    const chartHistory = []
    let value = indices.tunindex.value - (Math.random() * 50)

    for (let i = 30; i >= 0; i--) {
        value += (Math.random() - 0.48) * 5 // Slight upward bias
        chartHistory.push({
            time: new Date(Date.now() - i * 60000).toISOString(),
            value: Math.round(value * 100) / 100
        })
    }

    return {
        stocks,
        indices,
        sectors,
        chartHistory,
        lastUpdate: new Date().toISOString()
    }
}
