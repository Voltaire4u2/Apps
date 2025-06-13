// script.js (Updated with new PAT)
document.addEventListener('DOMContentLoaded', () => {
    const buttonsContainer = document.getElementById('buttons-container');
    const messageDiv = document.createElement('div');
    messageDiv.id = 'statusMessage';
    buttonsContainer.parentNode.insertBefore(messageDiv, buttonsContainer.nextSibling);

    // --- Airtable API Configuration ---
    const AIRTABLE_PAT = 'patewVnYLgaZkUID0.0d516abab3fd393773bae61ce119fb0804c2ec813b28ac3d8825a47825a33947'; // <-- UPDATED THIS LINE
    const AIRTABLE_BASE_ID = 'appzkENai2GZVOKx8';
    const AIRTABLE_TABLE_NAME = 'MyLinks'; // Make sure this matches your table name exactly, case-sensitive!

    const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    let links = [];

    // Function to display messages
    function showMessage(msg, type = 'info') {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }

    // Function to render buttons
    function renderButtons() {
        buttonsContainer.innerHTML = '';
        links.forEach(link => {
            const hyperlink = link.fields.Hyperlink;
            const buttonText = link.fields['Button Text'];

            if (hyperlink && buttonText) {
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
  "Authorization": "Bearer …",
  "Content-Type": "application/json"
}

            });

            if (!response.ok) {
                const errorData = await response.json();
                // Check for specific error messages from Airtable
                let errorMessage = errorData.error?.message || 'Unknown error';
                if (response.status === 401 || response.status === 403) {
                    errorMessage = `Authorization Error: Check your PAT's validity and permissions. Airtable says: ${errorMessage}`;
                } else if (response.status === 404) {
                    errorMessage = `Resource Not Found: Check your Base ID or Table Name. Airtable says: ${errorMessage}`;
                }
                throw new Error(`Airtable API error: ${response.status} - ${errorMessage}`);
            }

            const data = await response.json();
            links = data.records;
            renderButtons();
            showMessage('Links loaded successfully!', 'success');
        } catch (error) {
            console.error("Could not load links from Airtable:", error);
            showMessage(`Error loading links: ${error.message}`, 'error');
            buttonsContainer.innerHTML = '<p>Error loading links. Please check your Airtable setup, PAT, or browser console for details.</p>';
        }
    }

    // Initial load of links
    loadLinks();
});
