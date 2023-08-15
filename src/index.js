import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '38833534-5a079cf257db908c3807823b4';
const BASE_URL = 'https://pixabay.com/api/';
const ITEMS_PER_PAGE = 40;

const searchForm = document.querySelector('#searchForm');
const gallery = document.querySelector('#gallery');
const loadMoreButton = document.querySelector('#loadMoreButton');

let currentPage = 1;
let currentQuery = '';

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();
  if (searchQuery === '') {
    return;
  }

  clearGallery();
  currentPage = 1;
  currentQuery = searchQuery;
  searchImages(currentQuery);
});

loadMoreButton.addEventListener('click', () => {
  if (currentPage >= totalPages) {
    Notiflix.Notify.info('You have reached the end of the images.');
    return;
  }

  currentPage++;
  searchImages(currentQuery);
});

let searchPerformed = false;
let totalPages = 0;
let totalHits = 0;

async function searchImages(query) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      },
    });

    const { data } = response;
    const images = data.hits;
    totalHits = data.totalHits;

    if (images.length === 0) {
      Notiflix.Notify.info('Sorry, there are no images matching your search query. Please try again.');
      hideLoadMoreButton();
      clearGallery();
      return;
    }

    renderImages(images);

    if (currentPage === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      searchPerformed = true;
      totalPages = Math.ceil(totalHits / ITEMS_PER_PAGE);
    }

    if (currentPage < totalPages) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
    }
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
    clearGallery();
  }
}

function renderImages(images) {
  const galleryHTML = images
    .map((image) => createImageCard(image))
    .join('');

  gallery.insertAdjacentHTML('beforeend', galleryHTML);
  initLightbox();
}

function createImageCard(image) {
  return `
    <div class="photo-card">
      <a href="${image.largeImageURL}" data-lightbox="gallery">
        <img src="${image.webformatURL}" alt="${image.tags}" width="240" height="240">
      </a>
      <div class="info">
        <p class="info-item">Tags: ${image.tags}</p>
        <p class="info-item">Likes: ${image.likes}</p>
        <p class="info-item">Views: ${image.views}</p>
        <p class="info-item">Downloads: ${image.downloads}</p>
      </div>
    </div>
  `;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
  if (currentPage === totalPages && currentPage > 1) {
    Notiflix.Notify.info('You have reached the end of the images.');
  }
}

function scrollToNextGroup() {
  const topOfNextGroup = gallery.offsetTop + gallery.offsetHeight + 20;
  window.scrollTo({
    top: topOfNextGroup,
    behavior: 'smooth',
  });
}

function initLightbox() {
  const lightbox = new SimpleLightbox('.photo-card a');
  lightbox.on('show.simplelightbox', () => {
    document.querySelector('body').style.overflowY = 'hidden';
  });
  lightbox.on('close.simplelightbox', () => {
    document.querySelector('body').style.overflowY = 'auto';
  });
}