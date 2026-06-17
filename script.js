document.addEventListener('DOMContentLoaded', () => {
    const voteButtons = document.querySelectorAll('.vote-btn');
    const count1 = document.getElementById('count1');
    const count2 = document.getElementById('count2');

    // Load votes from localStorage or init
    let votes = JSON.parse(localStorage.getItem('yugiohVotes')) || {1:0,2:0};
    count1.textContent = votes[1];
    count2.textContent = votes[2];

    voteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            votes[id] = (votes[id] || 0) + 1;
            localStorage.setItem('yugiohVotes', JSON.stringify(votes));
            if (id === 1) {
                count1.textContent = votes[1];
            } else {
                count2.textContent = votes[2];
            }
            // Optional visual feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 150);
        });
    });
});