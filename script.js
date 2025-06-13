// script.js
document.addEventListener('DOMContentLoaded', () => {
    const buttonsContainer = document.getElementById('buttons-container');
    const messageDiv = document.createElement('div');
    messageDiv.id = 'statusMessage';
    buttonsContainer.parentNode.insertBefore(messageDiv, buttonsContainer.nextSibling);

    // Airtable API Configuration
    const AIRTABLE_PAT = 'paty946Z2KgywTYGy…';
    const AIRTABLE_BASE_ID = 'appYY4nSEJouUfKL6';
    const AIRTABLE_TABLE_NAME = 'Hyperlinks';
    const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    let links = [];

    function showMessage(msg, type = 'info') {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => messageDiv.style.display = 'none', 3000);
    }

    // NEW: list your categories here, in the order you want them displayed
    const CATEGORIES = ['Study', 'Games', 'News', 'Social Media'];

    function renderButtons() {
        buttonsContainer.innerHTML = '';

        CATEGORIES.forEach(category => {
            // Filter links for this category
            const items = links.filter(link => link.fields.Category === category);

            if (items.length) {
                // Section heading
                const heading = document.createElement('h2');
                heading.textContent = category;
                heading.classList.add('category-heading');
                buttonsContainer.appendChild(heading);

                // Buttons grid for this category
                const sectionGrid = document.createElement('div');
                sectionGrid.classList.add('buttons-grid', 'category-section');

                items.forEach(link => {
                    const url = link.fields.Hyperlink;
                    const text = link.fields['Button Text'];
                    if (url && text) {
                        const btn = document.createElement('a');
                        btn.classList.add('link-button');
                        btn.href = url;
                        btn.textContent = text;
                        btn.target = '_blank';
                        btn.rel = 'noopener noreferrer';
                        sectionGrid.appendChild(btn);
                    }
                });

                buttonsContainer.appendChild(sectionGrid);
            }
        });
    }

    async function loadLinks() {
        try {
            showMessage('Loading links…', 'info');
            const res = await fetch(AIRTABLE_API_URL, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_PAT}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) throw await res.json();
            const data = await res.json();
            links = data.records;
            renderButtons();
            showMessage('Links loaded successfully!', 'success');
        } catch (err) {
            console.error('Error loading links:', err);
            showMessage(`Error loading links: ${err.error?.message || err}`, 'error');
            buttonsContainer.innerHTML = '<p>Error loading links—check console for details.</p>';
        }
    }

    loadLinks();
});
