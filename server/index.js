import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import cron from 'node-cron'
import { scrapeMarketData } from './scraper.js'
import { getMarketData, updateMarketData, generateDemoData } from './data.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST']
    }
})

const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// REST API - Get market data
app.get('/api/market', (req, res) => {
    const data = getMarketData()
    res.json(data)
})

// REST API - Get stocks only
app.get('/api/stocks', (req, res) => {
    const data = getMarketData()
    res.json(data.stocks || [])
})

// REST API - Get indices only
app.get('/api/indices', (req, res) => {
    const data = getMarketData()
    res.json(data.indices || {})
})

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    // Send current data immediately on connection
    socket.emit('market-update', getMarketData())

    // Handle data request
    socket.on('request-data', () => {
        socket.emit('market-update', getMarketData())
    })

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`)
    })
})

// Broadcast market updates to all connected clients
function broadcastUpdate() {
    const data = getMarketData()
    io.emit('market-update', data)
    console.log(`📊 Broadcast market update to ${io.engine.clientsCount} clients`)
}

// Scrape and update market data
async function refreshMarketData() {
    console.log('🔄 Refreshing market data...')

    try {
        const scrapedData = await scrapeMarketData()

        if (scrapedData && scrapedData.stocks && scrapedData.stocks.length > 0) {
            updateMarketData(scrapedData)
            console.log(`✅ Successfully scraped ${scrapedData.stocks.length} stocks`)
        } else {
            console.log('⚠️ No data scraped, using demo data')
            const demoData = generateDemoData()
            updateMarketData(demoData)
        }
    } catch (error) {
        console.error('❌ Scraping error:', error.message)
        // Fallback to demo data simulation
        const demoData = generateDemoData()
        updateMarketData(demoData)
    }

    broadcastUpdate()
}

// Initial data load
console.log('🚀 TunisiaStock Server starting...')

// Generate initial demo data immediately
const initialData = generateDemoData()
updateMarketData(initialData)
console.log('📈 Initial demo data loaded')

// Try to scrape real data after startup
setTimeout(async () => {
    await refreshMarketData()
}, 3000)

// Schedule data refresh every 30 seconds
cron.schedule('*/30 * * * * *', async () => {
    await refreshMarketData()
})

// Also simulate small price fluctuations every 5 seconds for demo effect
cron.schedule('*/5 * * * * *', () => {
    const currentData = getMarketData()

    if (currentData.stocks && currentData.stocks.length > 0) {
        // Small random price variations
        const updatedStocks = currentData.stocks.map(stock => ({
            ...stock,
            price: Math.round((stock.price * (1 + (Math.random() - 0.5) * 0.002)) * 100) / 100,
            volume: stock.volume + Math.floor(Math.random() * 100)
        }))

        // Update indices slightly
        const updatedIndices = {
            tunindex: {
                ...currentData.indices.tunindex,
                value: Math.round((currentData.indices.tunindex.value * (1 + (Math.random() - 0.5) * 0.0005)) * 100) / 100
            },
            tunindex20: {
                ...currentData.indices.tunindex20,
                value: Math.round((currentData.indices.tunindex20.value * (1 + (Math.random() - 0.5) * 0.0005)) * 100) / 100
            }
        }

        // Add new chart point
        const newChartPoint = {
            time: new Date().toISOString(),
            value: updatedIndices.tunindex.value
        }

        const chartHistory = [...(currentData.chartHistory || []), newChartPoint].slice(-60)

        updateMarketData({
            ...currentData,
            stocks: updatedStocks,
            indices: updatedIndices,
            chartHistory
        })

        broadcastUpdate()
    }
})

// Start server
httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🚀 TunisiaStock Server                           ║
║                                                    ║
║   📡 Running on http://localhost:${PORT}             ║
║   🔌 WebSocket ready                               ║
║   📊 Scraping ilboursa.com every 30s              ║
║                                                    ║
╚════════════════════════════════════════════════════╝
  `)
})
