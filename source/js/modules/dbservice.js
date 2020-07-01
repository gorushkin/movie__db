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

  generateFullData = async (type, data) => {
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
    const data = await this.getData(this.temp);
    return await this.generateFullData('moviesList', data);
  };

  gettvShowsList = async (query, language) => {
    this.temp = `${this.getServerPath()}/search/tv?api_key=${this.getApiKey()}&language=${language}&query=${query}`;
    const data = await this.getData(this.temp);
    return await this.generateFullData('tvShowsList', data);
  };

  getNextPage = (page) => {
    return this.getData(`${this.temp}&page=${page}`);
  }

  getItemInfo = async (id, itemType, type, language) => {
    const data = await this.getData(`${this.getServerPath()}/${itemType}/${id}?api_key=${this.getApiKey()}&language=${language}`);
    return this.rebuildActions[type](data);
  }
}
