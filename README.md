# 🚀 TunisiaStock Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Socket.io-4.7-010101?style=for-the-badge&logo=socket.io" alt="Socket.io">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js" alt="Node.js">
</p>

<p align="center">
  <strong>Dashboard analytique cyberpunk de la Bourse de Tunis (BVMT) en temps réel</strong>
</p>

---

## ✨ Fonctionnalités

- 📊 **Indices en direct** - TUNINDEX et TUNINDEX 20 avec variations
- 📈 **Graphique temps réel** - Évolution du TunIndex avec Chart.js
- 🔥 **Heat Map Secteurs** - Performance par secteur animée
- 📋 **Tableau de cotations** - Tri, recherche, 30+ actions tunisiennes
- 📰 **News Ticker** - Bandeau défilant des cours
- 🎨 **Design Cyberpunk** - Néon, glassmorphism, animations

## 🛠️ Technologies

| Frontend | Backend |
|----------|---------|
| React 18 | Node.js + Express |
| Vite 5 | Socket.io |
| Chart.js | Cheerio (scraping) |
| Framer Motion | node-cron |

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/your-username/tunisia-stock-dashboard.git
cd tunisia-stock-dashboard
```

### 2. Installer les dépendances
```bash
# Frontend
npm install

# Backend  
cd server && npm install
```

### 3. Démarrer l'application

**Terminal 1 - Backend :**
```bash
cd server
npm start
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

### 4. Ouvrir le dashboard
Naviguer vers [http://localhost:5173](http://localhost:5173)

## 📁 Structure du projet

```
bourse/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── LiveChart.jsx      # Graphique TunIndex
│   │   ├── NewsTicker.jsx     # Bandeau défilant
│   │   ├── SectorHeatMap.jsx  # Heat map secteurs
│   │   ├── StatsCards.jsx     # Cards indices
│   │   └── StockTable.jsx     # Tableau cotations
│   ├── App.jsx                # Composant principal
│   ├── index.css              # Thème cyberpunk
│   └── main.jsx               # Entry point
├── server/
│   ├── index.js               # Express + Socket.io
│   ├── scraper.js             # Web scraper ilboursa
│   ├── data.js                # Cache + données démo
│   └── package.json
├── index.html
├── vite.config.js
└── package.json
```

## 🔧 Configuration

### Intervalle de rafraîchissement
Dans `server/index.js`, modifier le cron pour ajuster la fréquence :

```javascript
// Toutes les 30 secondes
cron.schedule('*/30 * * * * *', async () => {
  await refreshMarketData()
})
```

### Mode démo
Le serveur génère automatiquement des données de démonstration si le scraping échoue, assurant un dashboard fonctionnel à tout moment.

## ⚠️ Avertissement

> **Utilisation responsable** : Ce projet utilise le web scraping d'ilboursa.com pour un usage éducatif/personnel uniquement. Ne pas utiliser commercialement sans autorisation. Les données sont différées de 15 minutes.

## 🎨 Thème Cyberpunk

Le design s'inspire de l'esthétique cyberpunk avec :

- **Palette néon** : Cyan (#00f5ff), Magenta (#ff00ff), Violet (#bf00ff)
- **Fond sombre** : Grille animée avec effet scanline
- **Glassmorphism** : Cartes transparentes avec blur
- **Animations** : Pulse, flicker, glitch effects
- **Typographie** : Orbitron, Rajdhani, Share Tech Mono

## 📄 Licence

MIT © 2024

---

<p align="center">
  Développé avec ❤️ pour la communauté financière tunisienne
</p>
