document.addEventListener('DOMContentLoaded', () => {
    const offersContainer = document.getElementById('offers-container');
    const modal = document.getElementById('offerDetailsModal');
    const modalCloseBtn = modal.querySelector('.close-modal-btn');
    const modalRoomName = document.getElementById('modalRoomName');
    const modalContent = document.getElementById('modalOfferDetailsContent');
    const modalBookingLink = document.getElementById('modalBookingLink');

    if (!offersContainer || !modal) {
        console.error('Essential elements (offers container or modal) not found!');
        return;
    }

    // Eseménykezelés delegálással az egész konténerre
    offersContainer.addEventListener('click', (event) => {
        const target = event.target;
        
        // "Teljes leírás" gomb
        const readMoreBtn = target.closest('.read-more-btn');
        if (readMoreBtn) {
            const id = readMoreBtn.getAttribute('onclick').match(/'(desc-prog-.*?)'/)[1];
            const fullDesc = document.getElementById(id);
            const icon = readMoreBtn.querySelector('.fas');

            if (fullDesc) {
                const isVisible = fullDesc.style.display === 'block';
                fullDesc.style.display = isVisible ? 'none' : 'block';
                readMoreBtn.innerHTML = isVisible ? 'Teljes leírás <i class="fas fa-chevron-down"></i>' : 'Leírás becsukása <i class="fas fa-chevron-up"></i>';
                if(icon) {
                    icon.classList.toggle('fa-chevron-down', isVisible);
                    icon.classList.toggle('fa-chevron-up', !isVisible);
                }
            }
        }

        // "Részletek" gomb (mobilon)
        const detailsBtn = target.closest('.details-modal-button');
        if (detailsBtn) {
            try {
                const offerDetails = JSON.parse(detailsBtn.dataset.offerDetails);
                modalRoomName.textContent = offerDetails.room_name || 'Szoba részletei';
                
                let contentHTML = `<p><strong>Utazás:</strong> ${offerDetails.num_adults || 0} felnőtt, ${offerDetails.num_children || 0} gyerek</p>`;
                contentHTML += `<p><strong>Ellátás:</strong> ${offerDetails.food_service_name || 'N/A'}</p>`;
                contentHTML += `<p><strong>Utazás módja:</strong> ${offerDetails.road_type_name || 'N/A'}</p>`;
                
                modalContent.innerHTML = contentHTML;
                modalBookingLink.href = `http://nytms.byethost22.com/${offerDetails.offer_id}.html`;
                modal.style.display = 'block';
            } catch (e) {
                console.error('Error parsing offer details:', e);
                modalContent.innerHTML = '<p>A részletek betöltése sikertelen volt.</p>';
                modal.style.display = 'block';
            }
        }
    });

    // Modális ablak bezárása
    if(modalCloseBtn) {
        modalCloseBtn.onclick = () => { modal.style.display = 'none'; };
    }
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});
