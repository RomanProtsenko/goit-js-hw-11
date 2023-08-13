import {NewsApiService} from './api';
import { Notify } from 'notiflix';
import { lightbox } from './lightbox';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more')
};

let shownImagesCount = 0;
const apiService = new NewsApiService();

refs.form.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

const options = {
  rootMargin: '50px',
  root: null,
  threshold: 0.3,
};
const observer = new IntersectionObserver(onLoadMore, options);

function onSearch(event) {
  event.preventDefault();

  refs.gallery.innerHTML = '';
  apiService.query = event.currentTarget.elements.searchQuery.value.trim();
  apiService.resetPage();

  if (apiService.query === '') {
    Notify.warning('Please, fill in the search field');
    return;
  }

  shownImagesCount = 0;
  refs.loadMoreBtn.classList.add('is-hidden');
  fetchGallery();
}


async function fetchGallery() {
  refs.loadMoreBtn.classList.add('is-hidden');

  const res = await apiService.fetchGallery();
  const { hits, total, totalHits} = res;
  shownImagesCount += hits.length;
  
  if (!hits.length) {
      Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
    );
    refs.loadMoreBtn.classList.add('is-hidden');
    return;
  }
  
  renderGallery(hits);
  
  if (shownImagesCount === hits.length) {
      Notify.success(`Hooray! We found ${totalHits} images.`);
      refs.loadMoreBtn.classList.remove('is-hidden'); 
    }
    refs.loadMoreBtn.classList.remove('is-hidden'); 

    if (shownImagesCount < total) {
    refs.loadMoreBtn.classList.remove('is-hidden'); 
  }
    if (shownImagesCount >= total) {
        Notify.info("We're sorry, but you've reached the end of search results.");
        refs.loadMoreBtn.classList.add('is-hidden');
        return;
    }
}

function renderGallery(hits) {
    const markup = hits.map(({ largeImageURL, webformatURL, tags, likes, views, comments, downloads }) => `
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
    </div>`
          ).join('');
          refs.gallery.insertAdjacentHTML('beforeend', markup);
          lightbox.refresh();
}

function onLoadMore() {
    fetchGallery();
 }