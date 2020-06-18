const form = document.querySelector('.header__form');
const movies = document.querySelector('.movies');
const modal = document.querySelector('.modal');
const moviesList = document.querySelector('.movies__list');
const tvShowsList = document.querySelector('.tvshows__list');
const filters = document.querySelector('.filters');
const resultTabs = document.querySelectorAll('.search__result');

const elements = {
  moviesList: document.querySelector('.movies__list'),
  tvShowsList: document.querySelector('.tvshows__list'),
  moviesPaginationList: document.querySelector('.movies__pagination-list'),
  moviesSizeList: document.querySelector('.movies__size-list'),
}

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
    }
    render();
  }

  const buildPaginationItem = (index, isExtreme = undefined) => {
    const extremeTag = (isExtreme) ? isExtreme : '';
    const pagiationListItem = document.createElement('li');
    pagiationListItem.innerHTML = `<a href="" data-type="number" data-number="${index}" class=" btn-nav movies__pagination-link">${index}</a>`;
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
        console.log(state.currentPage);
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
    // elements.moviesSizeList.style.display = 'flex';
  }

  const getCurrentPageMovieList = (listName) => {
    const firstIndex = state.currentPage * state.resultSize - state.resultSize;
    const lastDataIndex = state[listName].length - 1;
    const lastIndex = (state.currentPage * state.resultSize > lastDataIndex) ? lastDataIndex : state.currentPage * state.resultSize - 1;
    return [firstIndex, lastIndex];
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
    renderList('moviesList');
    renderList('tvShowsList');
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
    const target = e.target.closest('.js__filter');
    if (target) {
      const filterName = target.dataset.name;
      const filterType = target.dataset.type;
      state.sorting[filterName] = filterType;
      filtersActions[filterName]();
      setActiveFilter(filterName, filterType);
    }
  }

  const renderModal = (data) => {
    console.log(data);
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
    modal.textContent = '';
    modal.classList.toggle('modal--show')
    modal.append(modalContent.renderModal());
    const modalCloseBtn = modal.querySelector('.modal__close');
    modalCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.toggle('modal--show')
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
    }
  }

  const getData = (query) => {
    const moviesList = new DBservice().getmoviesList(query, state.sorting.lang).then((data) => state.moviesList = data);
    const tvShowsList = new DBservice().gettvShowsList(query, state.sorting.lang).then((data) => state.tvShowsList = data);
    Promise.all([moviesList, tvShowsList]).then(() => {
      localStorage.setItem('state', JSON.stringify(state));
      render(state)
    });
  }

  const formHandler = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchValue = formData.get('search').trim();
    form.elements.search.value = '';
    getData(searchValue);
    state.query = searchValue;
  }

  const state = {
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

  form.addEventListener('submit', formHandler);
  getData('marvel', state);
  filters.addEventListener('click', filtersClickHandle);
  movies.addEventListener('click', itemClickHandler);
  elements.moviesPaginationList.addEventListener('click', navigationListClickHandler);
  elements.moviesSizeList.addEventListener('click', navigationListClickHandler);
  // elements.moviesSizeList.style.display = 'none';

}

app();
