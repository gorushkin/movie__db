Modal = class {
  constructor(id, title, poster_path, genres, vote_average, overview, homepage, release_date) {
    this.id = id;
    this.title = title;
    this.poster_path = poster_path;
    this.genres = genres;
    this.vote_average = vote_average;
    this.overview = overview;
    this.homepage = homepage;
    this.release_date = release_date;
  }

  getNoPosterImgPath = () => 'img/No_image_available.svg';
  getApiKey = () => '20ba111713def543aaca200d5d47a284';
  getUrl = () => 'https://image.tmdb.org/t/p/w300_and_h450_bestv2/';

  getImgPath = () => {
    const posterImg = (this.poster_path) ? this.getUrl() + this.poster_path : this.getNoPosterImgPath();
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

  getReleaseYear = () => new Date(this.release_date).getFullYear();

  render = () => {
    const modalContent = document.createElement('div');
    modalContent.className = 'modal__content';
    modalContent.innerHTML = `
      <div class="modal__poster-wrapper">
        <img src="${this.getImgPath()}" alt="" class="modal__poster">
      </div>
      <div class="modal__info">
      <div class="modal__info-wrapper">
        <h2 class="modal__title">
          ${this.title} <span>(${this.getReleaseYear()})</span>
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
