document.addEventListener('DOMContentLoaded', () => {
    const voteButtons = document.querySelectorAll('.vote-btn');
    const count1 = document.getElementById('count1');
    const count2 = document.getElementById('count2');
    const titleEl = document.querySelector('h1');
    const char1El = document.querySelector('#card1 h2');
    const char2El = document.querySelector('#card2 h2');
    const img1El = document.querySelector('#card1 img');
    const img2El = document.querySelector('#card2 img');
    const BACKEND_URL = 'https://yugioh-vote-backend.onrender.com'; // <-- change after deploying backend

    async function loadConfig() {
        try {
            const resp = await fetch(`${BACKEND_URL}/config`);
            if (!resp.ok) throw new Error('Backend config error');
            const data = await resp.json();
            return data;
        } catch (e) {
            // fallback to default values
            return {
                title: 'Quel personnage préférez-vous ?',
                char1: 'Personnage 1',
                char2: 'Personnage 2',
                image1: 'https://via.placeholder.com/150x200?text=Perso+1',
                image2: 'https://via.placeholder.com/150x200?text=Perso+2'
            };
        }
    }

    async function loadCounts() {
        try {
            const resp = await fetch(`${BACKEND_URL}/counts`);
            if (!resp.ok) throw new Error('Backend counts error');
            const data = await resp.json();
            return data;
        } catch (e) {
            // fallback to localStorage
            const votes = JSON.parse(localStorage.getItem('yugiohVotes')) || {1:0,2:0};
            return votes;
        }
    }

    async function vote(id) {
        try {
            const resp = await fetch(`${BACKEND_URL}/vote`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id})
            });
            if (!resp.ok) throw new Error('Vote failed');
            const data = await resp.json();
            // update counts from backend
            count1.textContent = data['1'] || 0;
            count2.textContent = data['2'] || 0;
            // also update localStorage for fallback
            const votes = JSON.parse(localStorage.getItem('yugiohVotes')) || {1:0,2:0};
            votes[id] = (votes[id] || 0) + 1;
            localStorage.setItem('yugiohVotes', JSON.stringify(votes));
        } catch (e) {
            // fallback to localStorage only
            const votes = JSON.parse(localStorage.getItem('yugiohVotes')) || {1:0,2:0};
            votes[id] = (votes[id] || 0) + 1;
            localStorage.setItem('yugiohVotes', JSON.stringify(votes));
            count1.textContent = votes[1];
            count2.textContent = votes[2];
            alert('Backend indisponible, vote enregistré localement');
        }
    }

    async function init() {
        const config = await loadConfig();
        if (titleEl) titleEl.textContent = config.title;
        if (char1El) char1El.textContent = config.char1;
        if (char2El) char2El.textContent = config.char2;
        if (img1El) img1El.src = config.image1;
        if (img2El) img2El.src = config.image2;
        const counts = await loadCounts();
        count1.textContent = counts['1'] || 0;
        count2.textContent = counts['2'] || 0;
    }

    init();

    voteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            vote(id);
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 150);
        });
    });
});