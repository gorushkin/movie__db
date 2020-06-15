const DBservice = class {
  constructor() {
    this.rebuildActions = {
      movieList: (n) => {
        'movieList',
        n.original_name,
        n.id,
        n.popularity,
        n.backdrop_path
      },
      tvShowList: (n) => {
        'tvShowList',
        n.title,
        n.id,
        n.popularity,
        backdrop_path
      },
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

  getSearchResult = (query, language = 'en-US') => {
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

    const rebuildActions = {
      movieList: ({
        id,
        title,
        popularity,
        genre_ids,
        overview,
        poster_path,
        backdrop_path,
        release_data,
        vote_average
      }) => ({
        type: 'movieList',
        id,
        title,
        popularity,
        genre_ids,
        overview,
        poster_path,
        backdrop_path,
        release_data,
        vote_average
      }),
      tvShowList: ({
        id,
        name,
        backdrop_path,
        genre_ids,
        overview,
        popularity,
        poster_path,
        vote_average
      }) => ({
        type: 'tvShowList',
        id,
        title: name,
        backdrop_path,
        genre_ids,
        overview,
        popularity,
        poster_path,
        vote_average
      }),
    }
    const modifiedData = fullData.map((n) => {
      return rebuildActions[type](n);
    })
    return modifiedData;
  }

  getMovieList = (query, language = 'en-US') => {
    this.temp = `${this.getServerPath()}/search/movie?api_key=${this.getApiKey()}&language=${language}&query=${query}`;
    const result = this.getData(this.temp)
      .then(this.generateFullData('movieList'))
    return result;
  };

  getTvShowList = (query, language = 'en-US') => {
    this.temp = `${this.getServerPath()}/search/tv?api_key=${this.getApiKey()}&language=${language}&query=${query}`;
    const result = this.getData(this.temp)
      .then(this.generateFullData('tvShowList'))
    return result;
  };

  getNextPage = (page) => {
    return this.getData(`${this.temp}&page=${page}`);
  }
}

const Movie = class {
  constructor(id, title, popularity, genre_ids, overview, poster_path, backdrop_path, release_data, vote_average) {
    this.id = id;
    this.title = title;
    this.popularity = popularity;
    this.genre_ids = genre_ids;
    this.overview = overview;
    this.poster_path = poster_path;
    this.backdrop_path = backdrop_path;
    this.release_data = release_data;
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

const form = document.querySelector('.header__form');
const moviesList = document.querySelector('.movies__list');
const tvShowsList = document.querySelector('.tvshows__list');
// const filterTypeList = document.querySelector('.filter__type-list')
const filters = document.querySelector('.filters');
const resultTabs = document.querySelectorAll('.search__result');

const tempFunc = (itemList) => {
  const fragment = document.createDocumentFragment();
  itemList.forEach(({
    id,
    title,
    popularity,
    genre_ids,
    overview,
    poster_path,
    backdrop_path,
    release_data,
    vote_average
  }) => {
    const movie = new Movie(id, title, popularity, genre_ids, overview, poster_path, backdrop_path, release_data, vote_average);
    fragment.append(movie.renderMovieCard());
  });
  return fragment;
}

const renderSearchResult = (state) => {
  moviesList.textContent = '';
  tvShowsList.textContent = '';
  moviesList.append(tempFunc(state.movieList));
  tvShowsList.append(tempFunc(state.tvShowList));
}

const getData = (query, state) => {
  if (localStorage.state) {
    renderSearchResult(JSON.parse(localStorage.getItem('state')))
  } else {
    const movieList = new DBservice().getMovieList(query).then((data) => state.movieList = data);
    const tvShowList = new DBservice().getTvShowList(query).then((data) => state.tvShowList = data);
    Promise.all([movieList, tvShowList]).then(() => {
      localStorage.setItem('state', JSON.stringify(state));
      renderSearchResult(state)});
  }
}

const formHandler = (state) => (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const searchValue = formData.get('search').trim();
  form.elements.search.value = '';
  getData(searchValue);
}

const filtersActions = {
  type: (state) => {
    resultTabs.forEach((tab) => {
      tab.classList.remove('search__result--active');
      if (tab.id === state.sorting.type) {
        tab.classList.add('search__result--active');
      }
    })

  },
  popularity: () => {},
  date: () => {},
}

const setActiveFilter = (filterName, filterType) => {
  const elements = document.querySelectorAll(`[data-name="${filterName}"]`);
  elements.forEach((element) => {
    element.classList.remove('filter__link--active');
    if (element.dataset.type === filterType) {
      element.classList.add('filter__link--active');
    }
  })
}

const filtersClickHandle = (state) => (e) => {
  e.preventDefault();
  const target = e.target.closest('.filter__link');
  const filterName = target.dataset.name;
  const filterType = target.dataset.type;
  state.sorting[filterName] = filterType;
  filtersActions[filterName](state);
  setActiveFilter(filterName, filterType);
}

const app = () => {
  const state = {
    language: 'ru-Ru',
    movieList: [],
    tvShowList: [],
    activeTab: 'movieList',
    sorting: {
      popularity: 'up',
      date: 'new',
      type: 'movieList',
    }
  }

  form.addEventListener('submit', formHandler(state));
  getData('hulk', state);
  filters.addEventListener('click', filtersClickHandle(state));
}

app();
