document.addEventListener('DOMContentLoaded', () => {
    const voteButtons = document.querySelectorAll('.vote-btn');
    const count1 = document.getElementById('count1');
    const count2 = document.getElementById('count2');
    const titleEl = document.getElementById('title');
    const char1El = document.querySelector('#card1 h2');
    const char2El = document.querySelector('#card2 h2');
    const img1El = document.querySelector('#card1 img');
    const img2El = document.querySelector('#card2 img');
    const resultDiv = document.getElementById('result');
    const cardsEl = document.getElementById('cards');
    const BACKEND_URL = 'https://yugioh-vote-backend.onrender.com'; // <-- change after deploying backend

    async function loadConfig() {
        try {
            const resp = await fetch(`${BACKEND_URL}/config`);
            if (!resp.ok) throw new Error('Backend config error');
            const data = await resp.json();
            return data;
        } catch (e) {
            // fallback to default values (no localStorage)
            return {
                title: 'Quel personnage préférez-vous ?',
                char1: 'Personnage 1',
                char2: 'Personnage 2',
                image1: 'https://via.placeholder.com/150x200?text=Perso+1',
                image2: 'https://via.placeholder.com/150x200?text=Perso+2',
                voting_closed: false,
                winner: null
            };
        }
    }

    async function loadCounts() {
        const resp = await fetch(`${BACKEND_URL}/counts`);
        if (!resp.ok) throw new Error('Backend counts error');
        return await resp.json();
    }

    async function vote(id) {
        try {
            const resp = await fetch(`${BACKEND_URL}/vote`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id})
            });
            const data = await resp.json();
            if (!resp.ok) {
                // backend error (cooldown, max votes, etc.)
                alert(data.error || 'Vote failed');
                return;
            }
            // success
            count1.textContent = data['1'] || 0;
            count2.textContent = data['2'] || 0;
        } catch (e) {
            // network or unexpected error
            alert('Backend indisponible: ' + e.message);
        }
    }

    async function init() {
        try {
            const config = await loadConfig();
            if (titleEl) titleEl.textContent = config.title;
            if (char1El) char1El.textContent = config.char1;
            if (char2El) char2El.textContent = config.char2;
            // if (img1El) img1El.src = config.image1;
            // if (img2El) img2El.src = config.image2;
            // Handle closed vote
            if (config.voting_closed) {
                // Hide title and cards
                titleEl.style.display = 'none';
                cardsEl.style.display = 'none';
                // Hide vote buttons
                voteButtons.forEach(btn => btn.style.display = 'none');
                // Show result
                const winnerName = config.winner === 1 ? config.char1 : config.winner === 2 ? config.char2 : 'Inconnu';
                resultDiv.textContent = `Le vainqueur est : ${winnerName}`;
                resultDiv.style.display = 'block';
            } else {
                // Show title and cards
                titleEl.style.display = '';
                cardsEl.style.display = '';
                // Show vote buttons
                voteButtons.forEach(btn => btn.style.display = '');
                // Hide result
                resultDiv.style.display = 'none';
            }
        } catch (e) {
            alert('Erreur de chargement de la configuration: ' + e.message);
        }
        try {
            const counts = await loadCounts();
            count1.textContent = counts['1'] || 0;
            count2.textContent = counts['2'] || 0;
        } catch (e) {
            alert('Impossible de charger les votes: ' + e.message);
            count1.textContent = 0;
            count2.textContent = 0;
        }
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