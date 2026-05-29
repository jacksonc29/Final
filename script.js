let streams = 0;
let pps = 0;
let spc = 1; 

const artistData = [
    { id: 'engineer', name: 'Sound Engineer', type:'staff' , cost: 50, pps: 0.5, clickBonus: 1, img: '...' },
    { id: 'producer', name: 'Executive Producer', type: 'staff' , cost: 500, pps: 5, clickBonus: 5, img: '...' },
    { id: '1300saint', name: '1300saint', type: 'artist' , cost: 15, pps: 1, rank: 8, lastRank:8, img: 'https://images.genius.com/f08bc343ba30395132a32cd35220a46d.618x618x1.jpg' }, 
    { id: 'ezcodylee', name: 'ezcodylee', type: 'artist' , cost: 100, pps: 5, rank: 7, lastRank: 7, img: 'https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3872370680747109477' },
    { id: 'bleood', name: 'bleood', type: 'artist' , cost: 500, pps: 15, rank: 6, lastRank: 6, img: '...' },
    { id: 'prettifun', name: 'prettifun', type: 'artist' , cost: 1200, pps: 40, rank: 5, lastRank: 5, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8mE984MIl1dyT4brBHb1mzBhQlQGSg27nDg&s' },
    { id: 'lucybedroque', name: 'lucybedroque', type: 'artist' , cost: 5000, pps: 120, rank: 4, lastRank: 4, img: '...' },
    { id: 'slayr', name: 'slayr', type: 'artist' , cost: 15000, pps: 450, rank: 3, lastRank: 3, img: '...' },
    { id: 'osamason', name: 'osamason', type: 'artist' , cost: 50000, pps: 1200, rank: 2, lastRank: 2, img: 'https://cdn-images.dzcdn.net/images/artist/7cc62ff8aa97ea0ac01868742073b6e2/1900x1900-000000-80-0-0.jpg' },
    { id: 'nettspend', name: 'nettspend', type:'artist' , cost: 150000, pps: 5000, rank: 1, lastRank: 1, img: 'https://i1.sndcdn.com/artworks-11s5K1llaYUHOhuy-qOYy5Q-t500x500.jpg' },
];

const ownedArtists = {};
artistData.forEach(a => ownedArtists[a.id] = 0);

// 2. Initialize Shop (The version that splits Staff vs Artists)
function initShop() {
    const artistShop = document.getElementById('shop-items');
    const staffShop = document.getElementById('staff-items');
    
    if(!artistShop || !staffShop) return;
    artistShop.innerHTML = '';
    staffShop.innerHTML = '';
    
    artistData.forEach(artist => {
        const card = document.createElement('div');
        card.id = `shop-${artist.id}`;
        card.className = 'upgrade locked';
        card.onclick = () => buyArtist(artist.id);
        
        card.innerHTML = `
            <img src="${artist.img}" class="artist-img" alt="${artist.name}">
            <div class="upg-info">
                <span class="name">${artist.name}</span>
                <span class="cost" id="cost-${artist.id}">Cost: ${formatNumber(artist.cost)}</span>
            </div>
            <div class="count" id="count-${artist.id}">0</div>
        `;

        if (artist.type === 'staff') {
            staffShop.appendChild(card);
        } else {
            artistShop.appendChild(card);
        }
    });
    updateShopStates();
}

// 3. Update Shop Visual States (Locked vs Afford vs Insufficient)
function updateShopStates() {
    artistData.forEach(artist => {
        const card = document.getElementById(`shop-${artist.id}`);
        const costEl = document.getElementById(`cost-${artist.id}`);
        const countEl = document.getElementById(`count-${artist.id}`);
        
        if (!card || !costEl || !countEl) return;

        costEl.innerText = `Cost: ${formatNumber(artist.cost)}`;
        countEl.innerText = ownedArtists[artist.id];

        const canAfford = streams >= artist.cost;
        const hasOwned = ownedArtists[artist.id] > 0;

        card.classList.toggle('locked', !hasOwned && !canAfford);
        card.classList.toggle('insufficient', hasOwned && !canAfford);
        card.classList.toggle('affordable', canAfford);
    });
}

// 4. Buying Logic
function buyArtist(id) {
    const data = artistData.find(a => a.id === id);
    if (data && streams >= data.cost) {
        streams -= data.cost;
        ownedArtists[id]++;
        
        pps += (data.pps || 0);
        if (data.clickBonus) {
            spc += data.clickBonus;
        }

        data.cost *= 1.15;
        updateLog(`Purchased ${data.name}!`);
        updateShopStates();
        updateUI();
        updateCharts(); // Force chart refresh instantly upon purchase!
    }
}

// 5. UI and Logs
function updateUI() {
    document.getElementById('play-count').innerText = formatNumber(streams);
    document.getElementById('pps-count').innerText = formatNumber(pps);
    document.getElementById('spc-count').innerText = formatNumber(spc);
}

function updateLog(msg) {
    const log = document.getElementById('console-log');
    if (log) {
        log.innerHTML = `> ${msg}<br>` + log.innerHTML;
    }
}

// 6. The Ranking System (The Filtered "Hot 100")
function updateCharts() {
    // FIX: Filter out unowned artists BEFORE calculating ranks. 
    // This stops unowned tied-at-zero artists from triggering #1 alerts.
    const sortedArtists = artistData
        .filter(a => a.type === 'artist' && ownedArtists[a.id] > 0) 
        .sort((a, b) => {
            const powerA = (a.pps || 0) * ownedArtists[a.id];
            const powerB = (b.pps || 0) * ownedArtists[b.id];
            return powerB - powerA; 
        });

    sortedArtists.forEach((artist, index) => {
        const newRank = index + 1;
        
        // If they hit #1 and weren't previously #1
        if (newRank === 1 && artist.rank !== 1) {
            updateLog(`⭐ ${artist.name} IS NOW #1 ON THE CHARTS!`);
        }
        
        artist.lastRank = artist.rank || newRank;
        artist.rank = newRank;
    });

    renderCharts(sortedArtists);
}

// 7. Render Charts to HTML
function renderCharts(sortedList) {
    const chartList = document.getElementById('chart-list');
    if (!chartList) return;

    chartList.innerHTML = ''; 

    sortedList.forEach((artist) => {
        const rankDiff = (artist.lastRank || artist.rank) - artist.rank;
        let trendIcon = rankDiff > 0 ? '▲' : (rankDiff < 0 ? '▼' : '↔️');
        let trendClass = rankDiff > 0 ? 'up' : (rankDiff < 0 ? 'down' : 'neutral');

        const item = document.createElement('div');
        item.className = 'chart-item';
        item.innerHTML = `
            <span class="rank-number">#${artist.rank}</span>
            <img src="${artist.img}" class="chart-img" alt="${artist.name}">
            <div class="chart-info">
                <span class="chart-name">${artist.name}</span>
                <span class="chart-pps">${formatNumber((artist.pps || 0) * ownedArtists[artist.id])} streams/sec</span>
            </div>
            <span class="trend ${trendClass}">${trendIcon}</span>
        `;
        chartList.appendChild(item);
    });
}

// Helper: Format Numbers cleanly (e.g. 1.5M, 250K)
function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    // Handle floating point decimals nicely for values < 1000 (like pps adding 0.5)
    return num % 1 === 0 ? num : num.toFixed(1);
}

// Clicker binding
document.getElementById('main-clicker').onclick = () => {
    streams += spc; 
    updateUI();
    updateShopStates();
};

// Main Game Loops
setInterval(() => {
    streams += pps;
    updateUI();
    updateShopStates();
}, 1000);

setInterval(updateCharts, 2000); // 2 seconds is perfectly fine for chart updates to save performance

// Initialize everything on boot
initShop();
updateUI();