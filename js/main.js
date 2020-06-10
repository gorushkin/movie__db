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
    console.log(fullData);
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

const form = document.querySelector('.header__form');

const getData = (query, state) => {
  const movieList = new DBservice().getMovieList(query).then(console.log);
  const tvShowList = new DBservice().getTvShowList(query).then(console.log);
}

const formHandler = (state) => (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const searchValue = formData.get('search').trim();
  form.elements.search.value = '';
  getData(searchValue);
}

const app = () => {
  const state = {
    language: 'ru-Ru',
    movieList: [],
    tvShowList: [],
  }

  form.addEventListener('submit', formHandler(state));
  getData('hulk', state);
}

app();
