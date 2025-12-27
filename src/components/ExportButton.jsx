import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

function ExportButton({ stocks, indices }) {
    const [showMenu, setShowMenu] = useState(false)
    const [exporting, setExporting] = useState(false)

    const formatDate = () => {
        return new Date().toLocaleDateString('fr-TN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const exportPDF = async () => {
        setExporting(true)
        try {
            const doc = new jsPDF()
            const date = formatDate()

            // Title
            doc.setFontSize(20)
            doc.setTextColor(0, 245, 255)
            doc.text('TunisiaStock - Rapport', 20, 20)

            doc.setFontSize(10)
            doc.setTextColor(128, 128, 128)
            doc.text(`Généré le ${date}`, 20, 28)

            // Indices
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text('Indices', 20, 45)

            doc.setFontSize(10)
            if (indices?.tunindex) {
                doc.text(`TUNINDEX: ${indices.tunindex.value.toFixed(2)} pts (${indices.tunindex.change >= 0 ? '+' : ''}${indices.tunindex.change.toFixed(2)}%)`, 20, 55)
            }
            if (indices?.tunindex20) {
                doc.text(`TUNINDEX 20: ${indices.tunindex20.value.toFixed(2)} pts (${indices.tunindex20.change >= 0 ? '+' : ''}${indices.tunindex20.change.toFixed(2)}%)`, 20, 62)
            }

            // Stocks table
            doc.setFontSize(14)
            doc.text('Cotations', 20, 80)

            // Table headers
            const headers = ['Symbole', 'Cours (TND)', 'Variation', 'Volume', 'Secteur']
            const startY = 90
            let y = startY

            doc.setFontSize(9)
            doc.setTextColor(0, 100, 150)
            headers.forEach((header, i) => {
                doc.text(header, 20 + i * 35, y)
            })

            // Table rows
            doc.setTextColor(0, 0, 0)
            stocks.forEach((stock, index) => {
                y = startY + 8 + index * 6
                if (y > 280) {
                    doc.addPage()
                    y = 20
                }

                doc.text(stock.symbol, 20, y)
                doc.text(stock.price.toFixed(2), 55, y)

                // Color for change
                if (stock.change >= 0) {
                    doc.setTextColor(0, 150, 0)
                } else {
                    doc.setTextColor(200, 0, 0)
                }
                doc.text(`${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%`, 90, y)

                doc.setTextColor(0, 0, 0)
                doc.text(stock.volume.toLocaleString(), 125, y)
                doc.text(stock.sector || '-', 160, y)
            })

            // Footer
            doc.setFontSize(8)
            doc.setTextColor(128, 128, 128)
            doc.text('TunisiaStock Dashboard - Données différées de 15 minutes', 20, 290)

            doc.save(`tunisiastock-${new Date().toISOString().split('T')[0]}.pdf`)
        } catch (error) {
            console.error('PDF export error:', error)
        }
        setExporting(false)
        setShowMenu(false)
    }

    const exportExcel = async () => {
        setExporting(true)
        try {
            // Prepare data
            const data = stocks.map(stock => ({
                'Symbole': stock.symbol,
                'Société': stock.name,
                'Cours (TND)': stock.price,
                'Variation (%)': stock.change,
                'Volume': stock.volume,
                'Secteur': stock.sector || '-'
            }))

            // Create workbook
            const wb = XLSX.utils.book_new()

            // Stocks sheet
            const ws = XLSX.utils.json_to_sheet(data)

            // Set column widths
            ws['!cols'] = [
                { width: 12 },
                { width: 40 },
                { width: 12 },
                { width: 12 },
                { width: 12 },
                { width: 15 }
            ]

            XLSX.utils.book_append_sheet(wb, ws, 'Cotations')

            // Indices sheet
            if (indices) {
                const indicesData = [
                    { 'Indice': 'TUNINDEX', 'Valeur': indices.tunindex?.value, 'Variation (%)': indices.tunindex?.change },
                    { 'Indice': 'TUNINDEX 20', 'Valeur': indices.tunindex20?.value, 'Variation (%)': indices.tunindex20?.change }
                ]
                const wsIndices = XLSX.utils.json_to_sheet(indicesData)
                XLSX.utils.book_append_sheet(wb, wsIndices, 'Indices')
            }

            // Save
            XLSX.writeFile(wb, `tunisiastock-${new Date().toISOString().split('T')[0]}.xlsx`)
        } catch (error) {
            console.error('Excel export error:', error)
        }
        setExporting(false)
        setShowMenu(false)
    }

    const exportCSV = () => {
        const headers = ['Symbole', 'Société', 'Cours', 'Variation', 'Volume', 'Secteur']
        const rows = stocks.map(s => [
            s.symbol,
            `"${s.name}"`,
            s.price,
            s.change,
            s.volume,
            s.sector || ''
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `tunisiastock-${new Date().toISOString().split('T')[0]}.csv`
        link.click()

        setShowMenu(false)
    }

    return (
        <div className="export-container">
            <button
                className="header-btn"
                onClick={() => setShowMenu(!showMenu)}
                disabled={exporting}
            >
                {exporting ? '⏳' : '📥'} Exporter
            </button>

            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        className="export-menu"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    >
                        <button onClick={exportPDF}>
                            📄 PDF
                        </button>
                        <button onClick={exportExcel}>
                            📊 Excel (.xlsx)
                        </button>
                        <button onClick={exportCSV}>
                            📋 CSV
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ExportButton
