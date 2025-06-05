// A DOMContentLoaded eseményfigyelő biztosítja, hogy a kód csak a teljes HTML oldal betöltődése után fusson le.
// Ezért az egész kódot beletesszük.
document.addEventListener('DOMContentLoaded', function() {
  
  // --- FÜGGVÉNYDEFINÍCIÓK ---

  function toggleDescription(descId, button) {
    var fullDesc = document.getElementById(descId);
    if (!fullDesc) return;
    var summaryDesc = fullDesc.parentElement.querySelector('.description-summary');
    var isHidden = fullDesc.style.display === "none" || fullDesc.style.display === "";
    if (isHidden) {
      if (summaryDesc) summaryDesc.style.display = "none";
      fullDesc.style.display = "block";
      button.innerHTML = 'Kevesebb <i class="fas fa-chevron-up"></i>';
    } else {
      if (summaryDesc) summaryDesc.style.display = "block";
      fullDesc.style.display = "none";
      button.innerHTML = 'Teljes leírás <i class="fas fa-chevron-down"></i>';
    }
  }

  function setupImageGallery(galleryElement) {
    const mainImageContainer = galleryElement.querySelector('.main-image-container');
    const mainImage = galleryElement.querySelector('.hero-main-image');
    const thumbnailElements = galleryElement.querySelectorAll('.scrollable-thumbnails-bar img');
    const thumbnails = Array.from(thumbnailElements);
    const prevArrow = galleryElement.querySelector('.hero-nav-arrow.prev-arrow');
    const nextArrow = galleryElement.querySelector('.hero-nav-arrow.next-arrow');

    if (!mainImageContainer || !mainImage || thumbnails.length === 0) {
      if (mainImageContainer) mainImageContainer.style.cursor = 'default';
      if (prevArrow) prevArrow.style.display = 'none';
      if (nextArrow) nextArrow.style.display = 'none';
      return;
    }

    const imagesData = [];
    thumbnails.forEach((thumbnail, index) => {
      const newSrc = thumbnail.getAttribute('data-new-src') || thumbnail.getAttribute('src');
      const newAlt = thumbnail.getAttribute('data-new-alt') || thumbnail.alt || `Kép ${index + 1}`;
      if (newSrc) {
        imagesData.push({
          src: newSrc,
          alt: newAlt
        });
      }
    });

    let currentIndex = 0;
    const currentMainImageSrc = mainImage.getAttribute('src');
    if (currentMainImageSrc && imagesData.length > 0) {
      const foundIndex = imagesData.findIndex(imgData => imgData.src === currentMainImageSrc);
      if (foundIndex !== -1) {
        currentIndex = foundIndex;
      } else if (imagesData[0]) {
        mainImage.setAttribute('src', imagesData[0].src);
        mainImage.setAttribute('alt', imagesData[0].alt);
        currentIndex = 0;
      }
    } else if (imagesData.length > 0 && imagesData[0]) {
      mainImage.setAttribute('src', imagesData[0].src);
      mainImage.setAttribute('alt', imagesData[0].alt);
      currentIndex = 0;
    }

    function updateThumbnails() {
      thumbnails.forEach((thumb, idx) => {
        thumb.classList.toggle('active-thumbnail', idx === currentIndex);
      });
      const hasMultipleImages = imagesData.length > 1;
      if (prevArrow) prevArrow.style.display = hasMultipleImages ? 'flex' : 'none';
      if (nextArrow) nextArrow.style.display = hasMultipleImages ? 'flex' : 'none';
      if (mainImageContainer) mainImageContainer.style.cursor = hasMultipleImages ? 'grab' : 'default';
    }

    function updateMainImage(newIndex, isSwipeOrArrow = false) {
      if (imagesData.length === 0) return;
      let targetIndex = newIndex;
      if (isSwipeOrArrow) {
        if (targetIndex < 0) targetIndex = imagesData.length - 1;
        if (targetIndex >= imagesData.length) targetIndex = 0;
      } else {
        if (targetIndex < 0 || targetIndex >= imagesData.length) return;
      }
      if (targetIndex === currentIndex && mainImage.getAttribute('src') === imagesData[targetIndex] ?.src && mainImage.complete) return;
      currentIndex = targetIndex;
      const nextImageData = imagesData[currentIndex];
      if (!nextImageData) return;
      mainImage.style.opacity = '0';
      setTimeout(() => {
        mainImage.setAttribute('src', nextImageData.src);
        mainImage.setAttribute('alt', nextImageData.alt);
        mainImage.style.opacity = '1';
        updateThumbnails();
      }, 150);
    }

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', function() {
        updateMainImage(index);
      });
    });
    if (prevArrow) prevArrow.addEventListener('click', () => updateMainImage(currentIndex - 1, true));
    if (nextArrow) nextArrow.addEventListener('click', () => updateMainImage(currentIndex + 1, true));
    updateThumbnails();
    let isDragging = false;
    let startX;
    let currentX;
    const dragThreshold = 30;

    function getPositionX(event) {
      return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function dragStart(event) {
      if (imagesData.length <= 1) return;
      isDragging = true;
      startX = getPositionX(event);
      currentX = startX;
      if (mainImageContainer) mainImageContainer.classList.add('dragging');
      if (event.type === 'mousedown') event.preventDefault();
    }

    function dragMove(event) {
      if (!isDragging) return;
      currentX = getPositionX(event);
    }

    function dragEnd(event) {
      if (!isDragging || imagesData.length <= 1) return;
      isDragging = false;
      if (mainImageContainer) mainImageContainer.classList.remove('dragging');
      const movedBy = currentX - startX;
      if (Math.abs(movedBy) > dragThreshold) {
        updateMainImage(currentIndex + (movedBy < 0 ? 1 : -1), true);
      }
    }
    if (mainImageContainer) {
      mainImageContainer.addEventListener('mousedown', dragStart);
      mainImageContainer.addEventListener('touchstart', dragStart, {
        passive: true
      });
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('touchmove', dragMove, {
        passive: true
      });
      document.addEventListener('mouseup', dragEnd);
      document.addEventListener('touchend', dragEnd);
    }
  }

  function openOfferDetailsModal(offerDataString) {
    const modal = document.getElementById('offerDetailsModal');
    const contentDiv = document.getElementById('modalOfferDetailsContent');
    const modalRoomName = document.getElementById('modalRoomName');
    const modalBookingLink = document.getElementById('modalBookingLink');
    if (!modal || !contentDiv || !modalRoomName || !modalBookingLink) {
      console.error("Modal elements not found!");
      return;
    }

    let decodedOfferDataString = offerDataString;
    try {
      const tempElem = document.createElement('textarea');
      tempElem.innerHTML = offerDataString;
      decodedOfferDataString = tempElem.value;
    } catch (e) {
      console.warn("Could not use DOM for HTML entity decoding.");
      // Fallback a sima replace-re
      decodedOfferDataString = offerDataString.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
    }

    try {
      const offerData = JSON.parse(decodedOfferDataString);
      modalRoomName.textContent = offerData.room_name || 'Ajánlat részletei';
      let detailsHtml = '';
      if (offerData.date_from && offerData.date_to) {
        detailsHtml += `<p><strong><i class="fas fa-calendar-alt"></i> Utazás:</strong> ${new Date(offerData.date_from).toLocaleDateString('hu-HU')} - ${new Date(offerData.date_to).toLocaleDateString('hu-HU')} (${offerData.num_nights || 'N/A'} éjszaka)</p>`;
      } else {
        detailsHtml += `<p><strong><i class="fas fa-calendar-alt"></i> Utazás:</strong> N/A</p>`;
      }
      detailsHtml += `<p><strong><i class="fas fa-users"></i> Utasok:</strong> ${offerData.num_adults || 'N/A'} felnőtt`;
      if (offerData.num_children && Number(offerData.num_children) > 0) {
        detailsHtml += `, ${offerData.num_children} gyerek`;
      }
      detailsHtml += `</p>`;
      detailsHtml += `<p><strong><i class="fas fa-utensils"></i> Ellátás:</strong> ${offerData.food_service_name || 'N/A'}</p>`;
      if (offerData.operator_name) {
        const operatorName = String(offerData.operator_name).replace(/&/g, '&');
        detailsHtml += `<p><strong><i class="fas fa-building"></i> Utazásszervező:</strong> ${operatorName}</p>`;
      }
      let priceAvailable = false;
      let formattedPriceHtml = '';
      let priceToFormat = offerData.price_total_for_details !== undefined ? offerData.price_total_for_details : offerData.price_total;
      let currencyForFormat = offerData.price_currency_code_for_details !== undefined ? offerData.price_currency_code_for_details : offerData.price_currency_code;
      if (priceToFormat != null && currencyForFormat) {
        let formattedPrice;
        let priceNum = parseFloat(priceToFormat);
        if (currencyForFormat === 'HUF') {
          formattedPrice = new Intl.NumberFormat('hu-HU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(priceNum) + ' Ft';
        } else if (currencyForFormat === 'EUR') {
          formattedPrice = new Intl.NumberFormat('de-DE', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(priceNum) + ' €';
        } else {
          formattedPrice = priceNum.toLocaleString('hu-HU') + ' ' + currencyForFormat;
        }
        formattedPriceHtml = `<p><strong><i class="fas fa-tag"></i> Ár:</strong> <span class="price-value" style="color: #d9534f; font-weight: bold; font-size:1.15em;">${formattedPrice}</span></p>`;
        priceAvailable = true;
      }
      if (priceAvailable) detailsHtml += formattedPriceHtml;
      contentDiv.innerHTML = detailsHtml;
      modalBookingLink.href = `http://nytms.byethost22.com/${offerData.offer_id || ''}.html`;
      modalBookingLink.style.display = 'inline-flex';
      modal.style.display = 'block';
    } catch (e) {
      console.error("Error parsing/setting modal content:", e, "Original str:", offerDataString, "Decoded str:", decodedOfferDataString);
      contentDiv.innerHTML = "<p>A részletek megjelenítése közben hiba történt.</p>";
      modalRoomName.textContent = 'Hiba';
      modalBookingLink.style.display = 'none';
      modal.style.display = 'block';
    }
  }

  // --- ESEMÉNYKEZELŐK INICIALIZÁLÁSA ---

  // Képgalériák inicializálása minden hotelhez
  document.querySelectorAll('.offer-program-group').forEach(group => {
    const heroSection = group.querySelector('.program-hero-section');
    if (heroSection) {
      setupImageGallery(heroSection);
    }
  });

  // Modális ablak bezárása
  const closeModalBtn = document.querySelector('#offerDetailsModal .close-modal-btn');
  const offerModal = document.getElementById('offerDetailsModal');
  if (closeModalBtn && offerModal) {
    closeModalBtn.onclick = function() {
      offerModal.style.display = 'none';
    }
    // Escape billentyű figyelése a modális bezárásához
    document.addEventListener('keydown', function(event) {
      if (event.key === "Escape" && offerModal.style.display === 'block') {
        offerModal.style.display = 'none';
      }
    });
  }

  // Modális bezárása, ha a háttérre kattintunk
  if (offerModal) {
    window.onclick = function(event) {
      if (event.target == offerModal) {
        offerModal.style.display = "none";
      }
    }
  }

  // Esemény delegálás a dinamikusan generált gombokhoz
  // (pl. a "tovább olvas" és "részletek" gombokhoz)
  document.body.addEventListener('click', function(event) {
    // "Tovább olvas" gomb kezelése
    const readMoreButton = event.target.closest('.read-more-btn');
    if (readMoreButton) {
        const descId = readMoreButton.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (descId) {
            toggleDescription(descId, readMoreButton);
        }
    }
    
    // "Részletek" gomb (modális) kezelése
    const detailsButton = event.target.closest('.details-modal-button');
    if (detailsButton) {
      event.preventDefault();
      const offerDataString = detailsButton.getAttribute('data-offer-details');
      if (offerDataString) {
        openOfferDetailsModal(offerDataString);
      } else {
        console.warn("Details modal button clicked but data-offer-details attribute is missing or empty.");
      }
    }
  });
});