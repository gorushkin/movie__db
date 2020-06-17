const tvShowsList = document.querySelector('.tv-shows__list');
const paginationList = document.querySelector('.tv-shows__pagination-list');
const filterList = document.querySelector('.tv-shows__filter-list');
const languageList = document.querySelector('.tv-shows__language-list');
const form = document.querySelector('.search__form');
const modal = document.querySelector('.modal');
const modalCloseBtn = modal.querySelector(`.cross`);


const DBservice = class {
  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Не удалось получить данные по адресу ${url}`)
    }
  }

  getApiKey = () => '20ba111713def543aaca200d5d47a284';
  getServerPath = () => 'https://api.themoviedb.org/3';

  getTestData = () => {
    return this.getData('data.json');
  }

  getSearchResult = (query, language = 'en-US') => {
    this.temp = `${this.getServerPath()}/search/movie?api_key=${this.getApiKey()}&language=${language}&query=${query}`;
    return this.getData(this.temp);
  };

  getNextPage = (page) => {
    return this.getData(`${this.temp}&page=${page}`);
  }

  getMovieInfo = (movieId, language) => this.getData(`${this.getServerPath()}/movie/${movieId}?api_key=${this.getApiKey()}&language=${language}`)

  // getTvShowInfo = (tvShowId) => this.getData(`${this.getServerPath()}/tv/${tvShowId}?api_key=${this.getApiKey()}&language=en-US`);

  getShowList = (query) => this.getData(`${this.getServerPath()}/tv/${query}?api_key=${this.getApiKey()}&language=en-US&page=1`);
}

const Movie = class {
  constructor(name, vote_average, poster_path = 'img/no-poster.jpg', backdrop_path, id) {
    this.name = name;
    this.vote_average = vote_average;
    this.poster_path = poster_path;
    this.backdrop_path = backdrop_path;
    this.id = id;
  }

  getNoPosterImgPath = () => 'img/no-poster.jpg';
  getApiKey = () => '20ba111713def543aaca200d5d47a284';
  getUrl = () => 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

  getImgPath = (poster_path) => {
    if (poster_path) {
      return this.getUrl() + poster_path;
    }
    return this.getNoPosterImgPath();
  }

  renderMovieCard = () => {
    const card = document.createElement('li');
    card.dataset.id = this.id;
    card.classList.add('tv-shows__item');
    const voteElem = (this.vote_average) ? `<span class="tv-card__vote">${this.vote_average}</span>` : ''
    card.innerHTML = `
        <a href="#" class="tv-card">
        ${voteElem}
        <img class="tv-card__img"
          src="${this.getImgPath(this.poster_path)}"
          data-backdrop="${this.getImgPath(this.backdrop_path)}"
          alt="${this.name}">
        <h4 class="tv-card__head">${this.name}</h4>
        </a>
    `;
    return card;
  }

  toString = () => this.name;
}

const getCurrentPageMovieList = (data, state) => {
  const firstIndex = state.currentPage * state.movieOnPageCount - state.movieOnPageCount;
  const lastDataIndex = data.length - 1;
  const lastIndex = (state.currentPage * state.movieOnPageCount > lastDataIndex) ? lastDataIndex : state.currentPage * state.movieOnPageCount - 1;
  return [firstIndex, lastIndex];
}

const renderMovieList = (data, state) => {
  const [firstIndex, lastIndex] = getCurrentPageMovieList(data, state);
  tvShowsList.textContent = '';
  const fragment = document.createDocumentFragment();
  for (let i = firstIndex; i <= lastIndex; i += 1) {
    const {
      title,
      vote_average,
      poster_path,
      backdrop_path,
      id
    } = data[i];
    const movie = new Movie(title, vote_average, poster_path, backdrop_path, id);
    fragment.append(movie.renderMovieCard());
  }
  tvShowsList.append(fragment);
}

const setActiveElement = (currentElement, itemTag) => {
  const elements = document.querySelectorAll(`.${itemTag}`);
  const activeElementTag = `${itemTag}--active`;
  elements.forEach((element) => {
    element.classList.remove(activeElementTag);
    if (element.dataset.number === currentElement.toString()) {
      element.classList.add(activeElementTag)
    }
  })
}

const filterHandler = (state, listItemTag, data) => (e) => {
  e.preventDefault();
  state.movieOnPageCount = e.target.closest('.tv-shows__filter-link').dataset.movieOnPage;
  state.currentFilter = +(e.target.closest('.tv-shows__filter-link').dataset.number);
  state.currentPage = 1;
  setActiveElement(state.currentFilter, listItemTag);
  renderPaginationList(data, state);
  renderMovieList(data, state);
}

const renderFilterList = (data, state) => {
  const listItemTag = 'tv-shows__filter-link';
  setActiveElement(state.currentFilter, listItemTag);
  filterList.addEventListener('click', filterHandler(state, listItemTag, data));
}

const paginationHandler = (state, listItemTag, data) => (e) => {
  e.preventDefault();
  const pageNumber = e.target.closest(`.${listItemTag}`).dataset.number;
  state.currentPage = +pageNumber;
  setActiveElement(state.currentPage, listItemTag);
  renderMovieList(data, state);
  renderPaginationList(data, state);
}

const buildPaginationItem = (index) => {
  const pagiationListItem = document.createElement('li');
  pagiationListItem.innerHTML = `<a href="#" data-number="${index}" class="tv-shows__pagination-link">${index}</a>`;
  pagiationListItem.className = 'tv-shows__pagination-item';
  return pagiationListItem;
}

const renderPaginationList = (data, state) => {
  paginationList.textContent = '';
  const pageCount = Math.ceil(data.length / state.movieOnPageCount);
  const fragment = document.createDocumentFragment();
  if (pageCount >= 6) {
    fragment.append(buildPaginationItem(1));
    for (i = Math.min(pageCount - 3, (Math.max(2, state.currentPage - 1))); i <= Math.max(4, (Math.min(state.currentPage + 1, pageCount - 1))); i += 1) {
      fragment.append(buildPaginationItem(i));
    };
    fragment.append(buildPaginationItem(pageCount));
  } else {
    for (let i = 1; i <= pageCount; i += 1) {
      fragment.append(buildPaginationItem(i));
    }
  }
  paginationList.append(fragment);
  const listItemTag = 'tv-shows__pagination-link';
  setActiveElement(state.currentPage, listItemTag);
}

const languageHandler = (state, listItemTag, data) => (e) => {
  e.preventDefault();
  state.currentlanguage = e.target.closest('.tv-shows__language-link').dataset.number;
  state.language = e.target.closest('.tv-shows__language-link').dataset.language;
  setActiveElement(state.currentlanguage, listItemTag);
}

const render = (state) => (data) => {
  const paginationListItemTag = 'tv-shows__pagination-link';
  paginationList.addEventListener('click', paginationHandler(state, paginationListItemTag, data));
  const filterListItemTag = 'tv-shows__filter-link';
  filterList.addEventListener('click', filterHandler(state, filterListItemTag, data));

  renderPaginationList(data, state);
  renderFilterList(data, state);
  renderMovieList(data, state);
}

const openModal = () => {
  modal.classList.remove('hide');
  document.body.style.overflow = 'hidden';
}

const closeModal = () => {
  modal.classList.add('hide');
  document.body.style.overflow = '';
}

const fillModal = (data) => {
  console.log(data);
}

const tvShowsListHandle = (state) => (e) => {
  e.preventDefault();
  const movieId = e.target.closest('.tv-shows__item').dataset.id;
  const dbService = new DBservice();
  dbService.getMovieInfo(movieId, state.language).then(fillModal);
  openModal();
}

const modalHandler = (e) => {
  e.preventDefault();
  if (e.target.closest('.modal')) {
    closeModal();
  }
}

modalCloseBtn.addEventListener('click', (e) => {
  closeModal();
})

const app = () => {
  const state = {
    movieOnPageCount: 6,
    currentPage: 1,
    currentFilter: 1,
    currentlanguage: 1,
    language: 'en-US',
  }

  const generateFullData = async (data) => {
    const fullData = [];
    const pagesCount = data.total_pages;
    const currentPageResults = data.results;
    fullData.push(...currentPageResults)
    if (pagesCount > 1) {
      for (let i = 2; i <= pagesCount; i += 1) {
        const nextPageResults = await dbService.getNextPage(i);
        fullData.push(...nextPageResults.results)
      }
    };
    return fullData;
  }

  const dbService = new DBservice();

  const languageListItemTag = 'tv-shows__language-link';
  languageList.addEventListener('click', languageHandler(state, languageListItemTag));
  setActiveElement(state.currentlanguage, languageListItemTag);
  tvShowsList.addEventListener('click', tvShowsListHandle(state));
  modal.addEventListener('click', modalHandler);

  dbService.getSearchResult('hulk', state.language).then(generateFullData).then(render(state));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchValue = formData.get('search').trim();
    form.elements.search.value = ''
    dbService.getSearchResult(searchValue, state.language).then(generateFullData).then(render(state));
  })
}

app();