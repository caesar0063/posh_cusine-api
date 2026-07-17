const galleryItems = document.querySelectorAll('.gallery-item img');

const lightbox = document.getElementById('lightbox');

const lightboxImage = document.getElementById('lightbox-image');

const closeButton = document.querySelector('.close-lightbox');

galleryItems.forEach((image) => {
  image.addEventListener('click', () => {
    lightbox.classList.add('active');

    lightboxImage.src = image.src;

    lightboxImage.alt = image.alt;
  });
});

closeButton.addEventListener('click', () => {
  lightbox.classList.remove('active');
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove('active');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    lightbox.classList.remove('active');
  }
});
