// script.js (Updated for Airtable - Read Only)
document.addEventListener('DOMContentLoaded', () => {
    const buttonsContainer = document.getElementById('buttons-container');
    const messageDiv = document.createElement('div'); // For displaying messages
    messageDiv.id = 'statusMessage';
    buttonsContainer.parentNode.insertBefore(messageDiv, buttonsContainer.nextSibling); // Insert after buttons

    // --- Airtable API Configuration ---
    const AIRTABLE_PAT = 'patA1s3X8k9R8v71F.5574c831770e17622d645e99216d5573752e379b19e13467439c36825c0e0b3c'; // Replace with your token
    const AIRTABLE_BASE_ID = 'appYY4nSEJouUfKL6';           // Replace with your Base ID
    const AIRTABLE_TABLE_NAME = 'Links';                       // Replace with your table name if different

    const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    let links = [];

    // Function to display messages
    function showMessage(msg, type = 'info') {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`; // Add classes for styling
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000); // Hide after 3 seconds
    }

    // Function to render buttons
    function renderButtons() {
        buttonsContainer.innerHTML = '';
        links.forEach(link => {
            // Airtable field names are case-sensitive. Adjust if yours are different.
            const hyperlink = link.fields.Hyperlink;
            const buttonText = link.fields['Button Text'];

            if (hyperlink && buttonText) { // Only render if both exist
                const button = document.createElement('a');
                button.classList.add('link-button');
                button.href = hyperlink;
                button.textContent = buttonText;
                button.target = '_blank';
                button.rel = 'noopener noreferrer';
                buttonsContainer.appendChild(button);
            }
        });
    }

    // Function to load links from Airtable
    async function loadLinks() {
        try {
            showMessage('Loading links...', 'info');
            const response = await fetch(AIRTABLE_API_URL, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_PAT}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Airtable API error: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
            }

            const data = await response.json();
            links = data.records; // Airtable returns data in a 'records' array
            renderButtons();
            showMessage('Links loaded successfully!', 'success');
        } catch (error) {
            console.error("Could not load links from Airtable:", error);
            showMessage(`Error loading links: ${error.message}`, 'error');
            buttonsContainer.innerHTML = '<p>Error loading links. Please check your Airtable setup or API key.</p>';
        }
    }

    // Initial load of links
    loadLinks();
});