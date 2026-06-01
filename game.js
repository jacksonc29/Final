console.log("🟢 game.js loaded successfully from GitHub!");

let streams = 0;
let pps = 0;
let spc = 1; 

// Placed high-quality placeholders for blank items to keep them looking uniform
const artistData = [
    { id: 'engineer', name: 'Sound Engineer', type:'staff' , cost: 50, pps: 0.5, clickBonus: 1, img: 'https://placehold.co/150x150?text=Sound+Engineer' },
    { id: 'producer', name: 'Executive Producer', type: 'staff' , cost: 500, pps: 5, clickBonus: 5, img: 'https://placehold.co/150x150?text=Exec+Producer' },
    { id: '1300saint', name: '1300saint', type: 'artist' , cost: 15, pps: 1, rank: null, lastRank: null, img: 'https://images.genius.com/f08bc343ba30395132a32cd35220a46d.618x618x1.jpg' }, 
    { id: 'ezcodylee', name: 'ezcodylee', type: 'artist' , cost: 100, pps: 5, rank: null, lastRank: null, img: 'https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3872370680747109477' },
    { id: 'bleood', name: 'bleood', type: 'artist' , cost: 500, pps: 15, rank: null, lastRank: null, img: 'https://placehold.co/150x150?text=bleood' },
    { id: 'prettifun', name: 'prettifun', type: 'artist' , cost: 1200, pps: 40, rank: null, lastRank: null, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8mE984MIl1dyT4brBHb1mzBhQlQGSg27nDg&s' },
    { id: 'lucybedroque', name: 'lucybedroque', type: 'artist' , cost: 5000, pps: 120, rank: null, lastRank: null, img: 'https://placehold.co/150x150?text=lucybedroque' },
    { id: 'slayr', name: 'slayr', type: 'artist' , cost: 15000, pps: 450, rank: null, lastRank: null, img: 'https://placehold.co/150x150?text=slayr' },
    { id: 'osamason', name: 'osamason', type: 'artist' , cost: 50000, pps: 1200, rank: null, lastRank: null, img: 'https://cdn-images.dzcdn.net/images/artist/7cc62ff8aa97ea0ac01868742073b6e2/1900x1900-000000-80-0-0.jpg' },
    { id: 'nettspend', name: 'nettspend', type:'artist' , cost: 150000, pps: 5000, rank: null, lastRank: null, img: 'https://i1.sndcdn.com/artworks-11s5K1llaYUHOhuy-qOYy5Q-t500x500.jpg' },
];

const ownedArtists = {};
artistData.forEach(a => ownedArtists[a.id] = 0);

function initGame() {
    initShop();
    updateUI();
    
    const mainClicker = document.getElementById('main-clicker');
    if (mainClicker) {
        mainClicker.onclick = function() {
            streams += spc; 
            updateUI();
            updateShopStates();
        };
    }

    setInterval(() => {
        streams += pps;
        updateUI();
        updateShopStates();
    }, 1000);

    setInterval(updateCharts, 2000);
}

function initShop() {
    const artistShop = document.getElementById('shop-items');
    const staffShop = document.getElementById('staff-items');
    
    if (artistShop) artistShop.innerHTML = '';
    if (staffShop) staffShop.innerHTML = '';
    
    artistData.forEach(artist => {
        const card = document.createElement('div');
        card.id = `shop-${artist.id}`;
        
        // Expanded layout styles for a cleaner, bigger dashboard display row
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.padding = '10px';
        card.style.margin = '10px 0';
        card.style.border = '1px solid #ddd';
        card.style.borderRadius = '8px';
        card.style.cursor = 'pointer';
        card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
        card.onclick = () => buyArtist(artist.id);
        
        // Upgraded width/height style layouts to 70px for large artist profiles
        card.innerHTML = `
            <img src="${artist.img}" alt="${artist.name}" style="width:70px; height:70px; margin-right:15px; object-fit: cover; border-radius: 6px; border: 1px solid #eee;">
            <div style="flex-grow:1; text-align:left;">
                <div style="font-size:15px; font-weight:bold; margin-bottom:4px;">${artist.name}</div>
                <div id="cost-${artist.id}" style="font-size:13px; color:#555; font-weight:500;">Cost: ${formatNumber(artist.cost)}</div>
            </div>
            <div id="count-${artist.id}" style="font-weight:bold; font-size:16px; background:#f0f0f0; padding:4px 10px; border-radius:4px; min-width:20px; text-align:center;">0</div>
        `;

        if (artist.type === 'staff' && staffShop) {
            staffShop.appendChild(card);
        } else if (artist.type === 'artist' && artistShop) {
            artistShop.appendChild(card);
        }
    });
    updateShopStates();
}

function updateShopStates() {
    artistData.forEach(artist => {
        const card = document.getElementById(`shop-${artist.id}`);
        if (!card) return;

        const costEl = document.getElementById(`cost-${artist.id}`);
        const countEl = document.getElementById(`count-${artist.id}`);
        
        if (costEl) costEl.innerText = `Cost: ${formatNumber(artist.cost)}`;
        if (countEl) countEl.innerText = ownedArtists[artist.id];

        const canAfford = streams >= artist.cost;
        if (canAfford) {
            card.style.background = '#f0fff0';
            card.style.borderColor = '#a1e9a1';
            card.style.opacity = '1';
        } else {
            card.style.background = '#fff';
            card.style.borderColor = '#ddd';
            card.style.opacity = '0.6';
        }
    });
}

function buyArtist(id) {
    const data = artistData.find(a => a.id === id);
    if (data && streams >= data.cost) {
        streams -= data.cost;
        ownedArtists[id]++;
        
        pps += (data.pps || 0);
        if (data.clickBonus) {
            spc += data.clickBonus;
        }

        data.cost = Math.ceil(data.cost * 1.15);
        updateLog(`Purchased ${data.name}!`);
        updateShopStates();
        updateUI();
        updateCharts(); 
    }
}

function updateUI() {
    const playEl = document.getElementById('play-count');
    const ppsEl = document.getElementById('pps-count');
    const spcEl = document.getElementById('spc-count');
    
    if (playEl) playEl.innerText = formatNumber(streams);
    if (ppsEl) ppsEl.innerText = formatNumber(pps);
    if (spcEl) spcEl.innerText = formatNumber(spc);
}

function updateLog(msg) {
    const log = document.getElementById('console-log');
    if (log) {
        log.innerHTML = `> ${msg}<br>` + log.innerHTML;
    }
}

function updateCharts() {
    artistData.forEach(a => {
        if (a.type === 'artist' && ownedArtists[a.id] === 0) {
            a.rank = null;
            a.lastRank = null;
        }
    });

    const sortedArtists = artistData
        .filter(a => a.type === 'artist' && ownedArtists[a.id] > 0) 
        .sort((a, b) => {
            const powerA = (a.pps || 0) * ownedArtists[a.id];
            const powerB = (b.pps || 0) * ownedArtists[b.id];
            return powerB - powerA; 
        });

    sortedArtists.forEach((artist, index) => {
        const newRank = index + 1;
        if (newRank === 1 && artist.rank !== 1) {
            updateLog(`⭐ ${artist.name} IS NOW #1 ON THE CHARTS!`);
        }
        artist.lastRank = artist.rank || newRank;
        artist.rank = newRank;
    });

    renderCharts(sortedArtists);
}

function renderCharts(sortedList) {
    const chartList = document.getElementById('chart-list');
    if (!chartList) return;

    chartList.innerHTML = ''; 

    sortedList.forEach((artist) => {
        const rankDiff = (artist.lastRank || artist.rank) - artist.rank;
        let trendIcon = rankDiff > 0 ? '▲' : (rankDiff < 0 ? '▼' : '↔️');

        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.justifyContent = 'space-between';
        item.style.padding = '8px 10px';
        item.style.borderBottom = '1px dashed #eee';
        item.style.fontSize = '14px';
        item.innerHTML = `
            <span style="font-weight: 500;">#${artist.rank} ${artist.name}</span>
            <span style="color: #666;">${formatNumber((artist.pps || 0) * ownedArtists[artist.id])}/s ${trendIcon}</span>
        `;
        chartList.appendChild(item);
    });
}

function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num % 1 === 0 ? num : num.toFixed(1);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}