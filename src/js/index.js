import axios from 'axios';
import { Notify } from 'notiflix';
import { lightbox } from './lightbox';

class NewsApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.per_page = 40;
  }

  async fetchGallery() {
    const axiosOptions = {
      method: 'get',
      url: 'https://pixabay.com/api/',
      params: {
        key: '38833534-5a079cf257db908c3807823b4',
        q: this.searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: this.page,
        per_page: this.per_page,
      },
    };
    try {
      const response = await axios(axiosOptions);
      const { hits, totalHits, total } = response.data;
      
      this.incrementPage();
      return { hits, totalHits, total };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch images');
    }
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }
}

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const apiService = new NewsApiService();

refs.form.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

const options = {
  rootMargin: '50px',
  root: null,
  threshold: 0.3,
};

const observer = new IntersectionObserver(onIntersect, options);
observer.observe(refs.loadMoreBtn);

async function onSearch(event) {
  event.preventDefault();

  refs.gallery.innerHTML = '';
  apiService.query = event.currentTarget.elements.searchQuery.value.trim();
  apiService.resetPage();

  if (apiService.query === '') {
    Notify.warning('Please, fill in the search field');
    return;
  }

  refs.loadMoreBtn.classList.add('is-hidden');
  shownImagesCount = 0;
  fetchGallery();
}

let shownImagesCount = 0;

async function fetchGallery() {
  refs.loadMoreBtn.classList.add('is-hidden');

  try {
    const { hits, totalHits, total } = await apiService.fetchGallery();

    if (!hits.length) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    renderGallery(hits);

    shownImagesCount += hits.length;
    
    if (shownImagesCount === totalHits) {
      Notify.success(Hooray! We found ${totalHits} images.);
    }
    
    if (shownImagesCount < total) {
      refs.loadMoreBtn.classList.remove('is-hidden');
    }

    if (shownImagesCount >= total) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      refs.loadMoreBtn.classList.add('is-hidden');
    }
  } catch (error) {
    Notify.failure('Failed to fetch images');
  } finally {
    refs.loadMoreBtn.classList.remove('is-hidden');
  }
}

function renderGallery(hits) {
  const markup = hits
    .map(
      ({ largeImageURL, webformatURL, tags, likes, views, comments, downloads }) => 
      <div class="photo-card">
          <a href="${largeImageURL}">
              <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
          </a>
          <div class="info">
              <p class="info-item">
                <b>Likes</b>
                ${likes}
              </p>
              <p class="info-item">
                  <b>Views</b>
                  ${views}
              </p>
              <p class="info-item">
                  <b>Comments</b>
                  ${comments}
              </p>
              <p class="info-item">
                  <b>Downloads</b>
                  ${downloads}
              </p>
          </div>
      </div>
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

async function onLoadMore() {
  fetchGallery();
}

async function onIntersect(entries) {
  if (entries[0].isIntersecting) {
    fetchGallery();
  }
}