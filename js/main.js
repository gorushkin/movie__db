const DBservice = class {
  constructor() {
    this.rebuildActions = {
      moviesList: ({
        id,
        title,
        popularity,
        genres,
        overview,
        poster_path,
        backdrop_path,
        release_date,
        vote_average,
        homepage
      }) => ({
        type: 'moviesList',
        id,
        title,
        popularity,
        genres,
        overview,
        poster_path,
        backdrop_path,
        release_date,
        vote_average,
        homepage
      }),
      tvShowsList: ({
        id,
        name,
        backdrop_path,
        genres,
        overview,
        popularity,
        poster_path,
        vote_average,
        first_air_date,
        homepage
      }) => ({
        type: 'tvShowsList',
        id,
        title: name,
        backdrop_path,
        genres,
        overview,
        popularity,
        poster_path,
        vote_average,
        release_date: first_air_date,
        homepage
      }),
    }
  }

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

  getSearchResult = (query, language) => {
    this.temp = `${this.getServerPath()}/search/movie?api_key=${this.getApiKey()}&language=${language}&query=${query}`;
    return this.getData(this.temp);
  };

  generateFullData = (type) => async (data) => {
    const fullData = [];
    const pagesCount = data.total_pages;
    const currentPageResults = data.results;
    fullData.push(...currentPageResults)
    if (pagesCount > 1) {
      for (let i = 2; i <= pagesCount; i += 1) {
        const nextPageResults = await this.getNextPage(i);
        fullData.push(...nextPageResults.results)
      }
    };

    const modifiedData = fullData.map((n) => {
      return this.rebuildActions[type](n);
    })
    return modifiedData;
  }

  getmoviesList = async (query, language) => {
    this.temp = `${this.getServerPath()}/search/movie?api_key=${this.getApiKey()}&language=${language}&query=${query}`;
    const result = await this.getData(this.temp);
    const rebuildedData = await this.generateFullData('moviesList')(result);
    return rebuildedData;
  };

  gettvShowsList = (query, language) => {
    this.temp = `${this.getServerPath()}/search/tv?api_key=${this.getApiKey()}&language=${language}&query=${query}`;
    const result = this.getData(this.temp)
      .then(this.generateFullData('tvShowsList'))
    return result;
  };

  getNextPage = (page) => {
    return this.getData(`${this.temp}&page=${page}`);
  }

  getItemInfo = (id, itemType, type, language) => {
    const result = this.getData(`${this.getServerPath()}/${itemType}/${id}?api_key=${this.getApiKey()}&language=${language}`).then(this.rebuildActions[type]);
    return result;
  }
}

const form = document.querySelector('.header__form');
const movies = document.querySelector('.movies');
const moviesList = document.querySelector('.movies__list');
const tvShowsList = document.querySelector('.tvshows__list');
const filters = document.querySelectorAll('.js__filter');
const resultTabs = document.querySelectorAll('.search__result');

const elements = {
  body: document.body,
  header: document.querySelector('.header'),
  headerContent: document.querySelector('.header__content'),
  moviesList: document.querySelector('.movies__list'),
  tvShowsList: document.querySelector('.tvshows__list'),
  moviesPaginationList: document.querySelector('.movies__pagination-list'),
  moviesSizeList: document.querySelector('.movies__size-list'),
  preloader: document.querySelector('.preloader'),
  filters: document.querySelector('.filters'),
  filter: document.querySelectorAll('.filter'),
  filtersTitle: document.querySelector('.filters__title'),
  tabsPanel: document.querySelector('.movies__tab'),
  tabsTitles: document.querySelectorAll('.movies__tab-item'),
  modal: document.querySelector('.modal'),
};

const showPreloader = () => {
  elements.preloader.style.display = 'flex';
};

const hidePreloader = () => {
  elements.preloader.style.display = 'none';
};

const app = () => {
  const getBtnsParametrs = {
    number: () => ['.movies__pagination-link', 'number', 'currentPage'],
    size: () => ['.movies__size-link', 'size', 'resultSize']
  }

  const navigationListClickHandler = (e) => {
    e.preventDefault();
    const target = e.target.closest('.btn-nav');
    const taretType = target.dataset.type;
    const [className, dataName, stateKey] = getBtnsParametrs[taretType]();
    if (target) {
      state[stateKey] = parseInt(target.dataset[dataName], 10);
      if (taretType === 'size') {
        state.currentPage = 1;
      }
    }
    render();
  }

  const buildPaginationItem = (index, isExtreme = undefined) => {
    const extremeTag = (isExtreme) ? isExtreme : '';
    const pagiationListItem = document.createElement('li');
    pagiationListItem.innerHTML = `<a href="" data-type="number" data-number="${index}" class="btn btn-nav movies__pagination-link">${index}</a>`;
    pagiationListItem.className = `${extremeTag} movies__pagination-item`;
    return pagiationListItem;
  }

  const setActiveNavigationElement = ([className, dataName, stateKey]) => {
    const elements = document.querySelectorAll(className);
    elements.forEach((element) => {
      element.classList.remove('active');
      if (parseInt(element.dataset[dataName], 10) === state[stateKey]) {
        element.classList.add('active');
      }
    })
  }

  const renderPaginationList = (listName) => {
    if (state[listName].length === 0) {
      elements.moviesSizeList.style.display = 'none';
    } else {
      elements.moviesSizeList.style.display = 'flex';
    }
    elements.moviesPaginationList.textContent = '';
    const pageCount = Math.ceil(state[listName].length / state.resultSize);
    const fragment = document.createDocumentFragment();
    if (pageCount >= 6) {
      fragment.append(buildPaginationItem(1));
      const minIndex = Math.min(pageCount - 3, (Math.max(2, state.currentPage - 1)));
      const maxIndex = Math.max(4, (Math.min(state.currentPage + 1, pageCount - 1)))
      for (i = minIndex; i <= maxIndex; i += 1) {
        if (state.currentPage >= 4 && i === minIndex) {
          fragment.append(buildPaginationItem(i, 'first'));
        } else if (state.currentPage <= pageCount - 3 && i === maxIndex) {
          fragment.append(buildPaginationItem(i, 'last'));
        } else {
          fragment.append(buildPaginationItem(i));
        }
      };
      fragment.append(buildPaginationItem(pageCount));
    } else {
      for (let i = 1; i <= pageCount; i += 1) {
        fragment.append(buildPaginationItem(i));
      }
    }
    elements.moviesPaginationList.append(fragment);
    setActiveNavigationElement(getBtnsParametrs.number());
    setActiveNavigationElement(getBtnsParametrs.size());
  }

  const getCurrentPageMovieList = (listName) => {
    const firstIndex = state.currentPage * state.resultSize - state.resultSize;
    const lastDataIndex = state[listName].length - 1;
    const lastIndex = (state.currentPage * state.resultSize > lastDataIndex) ? lastDataIndex : state.currentPage * state.resultSize - 1;
    return [firstIndex, lastIndex];
  }

  const renderTabTitles = () => {
    const actions = {
      moviesList: () => `Movies (${state.moviesList.length})`,
      tvShowsList: () => `TV Shows (${state.tvShowsList.length})`,
    }
    elements.tabsTitles.forEach((tab) => {
      const tabName = tab.dataset.type;
      tab.innerText = actions[tabName]();
    })
  }

  const renderList = (listName) => {
    const [firstIndex, lastIndex] = getCurrentPageMovieList(listName);
    elements[listName].textContent = '';
    const messageTitle = document.createElement('h2');
    messageTitle.className = 'movies__title';
    const message = (state[listName].length === 0) ? 'По вашему запрсу ничего не найдено' : `Было найдено ${state[listName].length} элемента`
    messageTitle.textContent = message;
    elements[listName].append(messageTitle);
    if (state[listName].length !== 0) {
      const itemList = document.createElement('ul');
      itemList.className = 'item__list';
      for (let i = firstIndex; i <= lastIndex; i += 1) {
        const {
          id,
          title,
          popularity,
          genres,
          overview,
          poster_path,
          backdrop_path,
          release_date,
          vote_average
        } = state[listName][i];
        const movie = new Movie(id, title, popularity, genres, overview, poster_path, backdrop_path, release_date, vote_average);
        itemList.append(movie.renderMovieCard());
      };
      elements[listName].append(itemList);
    }
  }

  const render = () => {

    hidePreloader();
    renderList('moviesList');
    renderList('tvShowsList');
    renderTabTitles();
    renderPaginationList(state.sorting.type);

  }

  const filtersActions = {
    lang: () => {
      getData(state.query, state);
    },
    type: () => {
      resultTabs.forEach((tab) => {
        tab.classList.remove('search__result--active');
        if (tab.id === state.sorting.type) {
          tab.classList.add('search__result--active');
        }
      })
      state.currentPage = 1;
      renderPaginationList(state.sorting.type);
      renderList(state.sorting.type)
    },
    popularity: () => {
      switch (state.sorting.popularity) {
        case 'more':
          state[state.sorting.type].sort((b, a) => {
            return (a.vote_average - b.vote_average);
          })
          break;
        case 'less':
          state[state.sorting.type].sort((a, b) => {
            return (a.vote_average - b.vote_average);
          })
        default:
          break;
      }
      render()
    },
    date: () => {
      switch (state.sorting.date) {
        case 'new':
          state[state.sorting.type].sort((b, a) => {
            if (b.release_date > a.release_date) {
              return -1
            }
            if (b.release_date < a.release_date) {
              return 1
            }
            return 0
          })
          break;
        case 'old':
          state[state.sorting.type].sort((a, b) => {
            if (b.release_date > a.release_date) {
              return -1
            }
            if (b.release_date < a.release_date) {
              return 1
            }
            return 0
          })
        default:
          break;
      }
      render()
    },
  }

  const setActiveFilter = (filterName, filterType) => {
    const elements = document.querySelectorAll(`[data-name="${filterName}"]`);
    elements.forEach((element) => {
      element.classList.remove('active');
      if (element.dataset.type === filterType) {
        element.classList.add('active');
      }
    })
  }

  const filtersClickHandle = (e) => {
    e.preventDefault();
    const target = e.target;
    const filterName = target.dataset.name;
    const filterType = target.dataset.type;
    state.sorting[filterName] = filterType;
    filtersActions[filterName]();
    setActiveFilter(filterName, filterType);
  }

  const renderModal = (data) => {
    const {
      id,
      title,
      poster_path,
      genres,
      vote_average,
      overview,
      homepage
    } = data;
    const modalContent = new Modal(id, title, poster_path, genres, vote_average, overview, homepage);
    elements.modal.innerHTML = '';
    elements.modal.append(modalContent.render());
    hidePreloader();
    elements.modal.classList.toggle('modal--show');
    elements.body.style.overflow = 'hidden';
    const modalCloseBtn = elements.modal.querySelector('.modal__close');
    modalCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      elements.modal.classList.remove('modal--show');
      elements.body.style.overflow = '';
    })
  }

  const getMovieInfo = async () => {
    const itemType = (state.sorting.type === 'moviesList') ? 'movie' : 'tv';
    const movieInfo = await new DBservice().getItemInfo(state.currentMovieId, itemType, state.sorting.type, state.sorting.lang);
    renderModal(movieInfo);
  };

  const itemClickHandler = (e) => {
    e.preventDefault();
    const target = e.target.closest('.movies__item');
    if (target) {
      const itemId = target.dataset.id;
      state.currentMovieId = itemId;
      getMovieInfo();
      showPreloader();
    }
  }

  const getData = async (query) => {
    showPreloader();
    state.start = true;
    start();
    const moviesList = await new DBservice().getmoviesList(query, state.sorting.lang);
    const tvShowsList = await new DBservice().gettvShowsList(query, state.sorting.lang);
    state.moviesList = moviesList;
    state.tvShowsList = tvShowsList;
    render(state);
  }

  const start = () => {
    if (state.start) {
      elements.header.classList.remove('header--fullheight');
      elements.filters.classList.remove('hide');
      elements.tabsPanel.classList.remove('hide');
      elements.headerContent.style.transform = '';
    }
  }

  const formHandler = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchValue = formData.get('search').trim();
    form.elements.search.value = '';
    form.elements.search.blur();
    // state.start = true;
    // start();
    state.query = searchValue;
    getData(searchValue);
  }

  const filtersTitleHandler = (e) => {
    console.log('sdfgsdfg');
    console.log(elements.filter);
    e.preventDefault();
    elements.filter.forEach(item => {
      item.classList.toggle('hide');
    })
  }

  const moveHeader = () => {
    const windowHeight = window.innerHeight;
    const headerContentHeight = elements.headerContent.offsetHeight;
    const headerPosition = windowHeight / 2 - headerContentHeight / 2;
    elements.headerContent.style.transform = `translateY(${headerPosition}px)`;
  }

  const state = {
    start: false,
    language: 'ru-Ru',
    moviesList: [],
    tvShowsList: [],
    currentPage: 1,
    resultSize: 6,
    activeTab: 'moviesList',
    currentMovieId: null,
    query: undefined,
    modal: false,
    sorting: {
      popularity: 'up',
      date: 'new',
      type: 'moviesList',
      lang: 'ru-Ru',
    }
  }

  moveHeader();
  getData('marvel', state);
  filters.forEach(((filter) => {
    filter.addEventListener('click', filtersClickHandle);
  }))
  movies.addEventListener('click', itemClickHandler);
  elements.moviesPaginationList.addEventListener('click', navigationListClickHandler);
  elements.moviesSizeList.addEventListener('click', navigationListClickHandler);
  elements.moviesSizeList.style.display = 'none';
  form.addEventListener('submit', formHandler);
  elements.filtersTitle.addEventListener('click', filtersTitleHandler);
}

app();

Modal = class {
  constructor(id, title, poster_path, genres, vote_average, overview, homepage) {
    this.id = id;
    this.title = title;
    this.poster_path = poster_path;
    this.genres = genres;
    this.vote_average = vote_average;
    this.overview = overview;
    this.homepage = homepage;
  }

  getNoPosterImgPath = () => 'img/No_image_available.svg';
  getApiKey = () => '20ba111713def543aaca200d5d47a284';
  getUrl = () => 'https://image.tmdb.org/t/p/w300_and_h450_bestv2/';

  getImgPath = (poster_path) => {
    const posterImg = (poster_path) ? this.getUrl() + poster_path : this.getNoPosterImgPath();
    return posterImg;
  }

  getGenresList = () => this.genres.reduce((acc, {
    name
  }, index, arr) => {
    const separator = (index !== arr.length - 1) ? ', ' : '';
    return `${acc}${name}${separator}`
  }, '');

  getHomePage = () => {
    const homePage = (this.homepage) ? `<a class="modal__link" href="${this.homepage}" target="_blanc">Официальная страница</a>` : '';
    return homePage
  }


  render = () => {
    const modalContent = document.createElement('div');
    modalContent.className = 'modal__content';
    modalContent.innerHTML = `
      <div class="modal__poster-wrapper">
        <img src="${this.getImgPath(this.poster_path)}" alt="" class="modal__poster">
      </div>
      <div class="modal__info">
      <div class="modal__info-wrapper">
        <h2 class="modal__title">
          ${this.title} <span>(2019)</span>
        </h2>
        <div class="modal__genres modal__info-block">
          <h3>Жанр:</h3>
          <p class="modal__genres-list">
            ${this.getGenresList()}
          </p>
        </div>
        <div class="modal__info-block">
          <h3>Рейтинг</h3>
          <span class="modal__rating">${this.vote_average}</span>
        </div>
        <div class="modal__info-block">
          <h3>Обзор: </h3>
          <div class="modal__overview">
            <p>
              ${this.overview}
            </p>
          </div>
        </div>
      </div>
      <h3>${this.getHomePage()}</h3>
      <div class="modal__close"></div>
    </div>
      `
    return modalContent;
  }

  get = (value) => {
    return `${this[value]}`
  };

  showInfo = () => {
    console.log(this.title, this.id);
  }
}

const Movie = class {
  constructor(id, title, popularity, genres, overview, poster_path, backdrop_path, release_date, vote_average) {
    this.id = id;
    this.title = title;
    this.popularity = popularity;
    this.genres = genres;
    this.overview = overview;
    this.poster_path = poster_path;
    this.backdrop_path = backdrop_path;
    this.release_date = release_date;
    this.vote_average = vote_average;
  }

  getNoPosterImgPath = () => 'img/No_image_available.svg';
  getApiKey = () => '20ba111713def543aaca200d5d47a284';
  getUrl = () => 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
  getImgPath = (poster_path) => {
    const posterImg = (poster_path) ? this.getUrl() + poster_path : this.getNoPosterImgPath();
    return posterImg;
  }

  renderMovieCard = () => {
    const card = document.createElement('li');
    card.classList.add('movies__item');
    card.dataset.id = this.id;
    const voteElem = (this.vote_average) ? `<span class="card__vote">${this.vote_average}</span>` : ''
    card.innerHTML = `
    <a href="#" class="movies__card card">
          ${voteElem}
          <img src="${this.getImgPath(this.poster_path)}" alt="${this.title}" class="card__img">
          <h3 class="card__title">${this.title}</h3>
        </a>
    `;
    return card;
  }
}

//# sourceMappingURL=main.js.map
