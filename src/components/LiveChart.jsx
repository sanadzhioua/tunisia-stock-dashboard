import { useEffect, useRef } from 'react'
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

function LiveChart({ data }) {
    const chartRef = useRef(null)

    const formatTime = (isoString) => {
        const date = new Date(isoString)
        return date.toLocaleTimeString('fr-TN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const chartData = {
        labels: data.map(d => formatTime(d.time)),
        datasets: [
            {
                label: 'TUNINDEX',
                data: data.map(d => d.value),
                fill: true,
                borderColor: '#00f5ff',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
                    gradient.addColorStop(0, 'rgba(0, 245, 255, 0.3)')
                    gradient.addColorStop(0.5, 'rgba(0, 245, 255, 0.1)')
                    gradient.addColorStop(1, 'rgba(0, 245, 255, 0)')
                    return gradient
                },
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#00f5ff',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                tension: 0.4
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                display: false
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
                    size: 14
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: (items) => `🕐 ${items[0].label}`,
                    label: (item) => `TUNINDEX: ${item.parsed.y.toLocaleString('fr-TN', { minimumFractionDigits: 2 })} pts`
                }
            }
        },
        scales: {
            x: {
                display: true,
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
                display: true,
                position: 'right',
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
                    callback: (value) => value.toLocaleString('fr-TN')
                }
            }
        },
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        }
    }

    return (
        <div className="chart-container">
            <Line ref={chartRef} data={chartData} options={options} />
        </div>
    )
}

export default LiveChart
