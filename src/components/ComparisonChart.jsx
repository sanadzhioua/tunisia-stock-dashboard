import { useMemo } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

// Neon colors for different stocks
const COLORS = [
    { border: '#00f5ff', bg: 'rgba(0, 245, 255, 0.2)' },
    { border: '#ff00ff', bg: 'rgba(255, 0, 255, 0.2)' },
    { border: '#00ff88', bg: 'rgba(0, 255, 136, 0.2)' },
    { border: '#ff0080', bg: 'rgba(255, 0, 128, 0.2)' },
    { border: '#ffff00', bg: 'rgba(255, 255, 0, 0.2)' }
]

function ComparisonChart({ symbols, stocks }) {
    // Generate comparison data
    const chartData = useMemo(() => {
        const labels = []
        const now = Date.now()

        // Generate time labels (last 30 points)
        for (let i = 29; i >= 0; i--) {
            const time = new Date(now - i * 60000)
            labels.push(time.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' }))
        }

        // Generate datasets for each symbol
        const datasets = symbols.slice(0, 5).map((symbol, index) => {
            const stock = stocks.find(s => s.symbol === symbol)
            if (!stock) return null

            // Simulate historical data based on current price
            const basePrice = stock.price
            const data = []
            let price = basePrice * (1 - Math.random() * 0.02)

            for (let i = 0; i < 30; i++) {
                price += (Math.random() - 0.48) * (basePrice * 0.005)
                data.push(Math.round(price * 100) / 100)
            }
            // Ensure last point is current price
            data[29] = basePrice

            const color = COLORS[index % COLORS.length]

            return {
                label: symbol,
                data,
                borderColor: color.border,
                backgroundColor: color.bg,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: color.border,
                tension: 0.4,
                fill: false
            }
        }).filter(Boolean)

        return { labels, datasets }
    }, [symbols, stocks])

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#ffffff',
                    font: {
                        family: 'Orbitron',
                        size: 11
                    },
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 20, 0.95)',
                borderColor: '#00f5ff',
                borderWidth: 1,
                titleColor: '#00f5ff',
                bodyColor: '#ffffff',
                titleFont: {
                    family: 'Orbitron',
                    size: 12
                },
                bodyFont: {
                    family: 'Share Tech Mono',
                    size: 13
                },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (item) => `${item.dataset.label}: ${item.parsed.y.toFixed(2)} TND`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0, 245, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    font: {
                        family: 'Share Tech Mono',
                        size: 10
                    },
                    maxTicksLimit: 8
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 245, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    font: {
                        family: 'Share Tech Mono',
                        size: 10
                    },
                    callback: (value) => value.toFixed(2) + ' TND'
                }
            }
        },
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        }
    }

    // Stock info summary
    const stocksSummary = symbols.map(symbol => stocks.find(s => s.symbol === symbol)).filter(Boolean)

    return (
        <div className="comparison-chart">
            <div className="comparison-summary">
                {stocksSummary.map((stock, i) => (
                    <div
                        key={stock.symbol}
                        className="comparison-stock"
                        style={{ borderColor: COLORS[i % COLORS.length].border }}
                    >
                        <span className="stock-symbol" style={{ color: COLORS[i % COLORS.length].border }}>
                            {stock.symbol}
                        </span>
                        <span className="stock-price">{stock.price.toFixed(2)} TND</span>
                        <span className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ height: '350px', marginTop: '1rem' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    )
}

export default ComparisonChart
