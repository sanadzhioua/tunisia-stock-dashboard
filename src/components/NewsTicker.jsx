import { useMemo } from 'react'

function NewsTicker({ stocks }) {
    const tickerItems = useMemo(() => {
        if (!stocks || stocks.length === 0) return []

        // Create ticker content from stock data
        const items = stocks.map(stock => ({
            symbol: stock.symbol,
            price: stock.price,
            change: stock.change,
            isPositive: stock.change >= 0
        }))

        // Duplicate for seamless loop
        return [...items, ...items]
    }, [stocks])

    const formatPrice = (price) => {
        return price.toLocaleString('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    const formatChange = (change) => {
        return (change >= 0 ? '+' : '') + change.toFixed(2) + '%'
    }

    if (tickerItems.length === 0) {
        return null
    }

    return (
        <div className="news-ticker">
            <div
                className="news-ticker-content"
                style={{
                    animationDuration: `${tickerItems.length * 2}s`
                }}
            >
                {tickerItems.map((item, index) => (
                    <div key={`${item.symbol}-${index}`} className="news-item">
                        <span className="symbol">{item.symbol}</span>
                        <span>{formatPrice(item.price)} TND</span>
                        <span className={`change ${item.isPositive ? 'positive' : 'negative'}`}>
                            {item.isPositive ? '▲' : '▼'} {formatChange(item.change)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NewsTicker
