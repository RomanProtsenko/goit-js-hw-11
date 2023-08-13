import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionDelay: 400,
  captionsData: 'alt',
});

export { lightbox };