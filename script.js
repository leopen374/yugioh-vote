document.addEventListener('DOMContentLoaded', () => {
    const voteButtons = document.querySelectorAll('.vote-btn');
    const count1 = document.getElementById('count1');
    const count2 = document.getElementById('count2');
    const BACKEND_URL = 'https://yugioh-vote-backend.onrender.com'; // <-- change after deploying backend

    async function loadCounts() {
        try {
            const resp = await fetch(`${BACKEND_URL}/counts`);
            if (!resp.ok) throw new Error('Backend error');
            const data = await resp.json();
            count1.textContent = data['1'] || 0;
            count2.textContent = data['2'] || 0;
        } catch (e) {
            // fallback to localStorage
            const votes = JSON.parse(localStorage.getItem('yugiohVotes')) || {1:0,2:0};
            count1.textContent = votes[1];
            count2.textContent = votes[2];
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

    loadCounts();

    voteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            vote(id);
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 150);
        });
    });
});