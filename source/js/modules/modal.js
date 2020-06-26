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

  renderModal = () => {
    const modal = document.querySelector('.modal');
    return modal;
  }

  renderModal2 = (fragment) => {
    const modalContent = document.createElement('div');
    modalContent.className = 'modal__content';
    modalContent.innerHTML = `
      <div class="modal__poster-wrapper">
        <img src="${this.getImgPath(this.poster_path)}" alt="" class="modal__poster">
      </div>
      <div class="modal__info">
        <h2 class="modal__title">
          ${this.title}
        </h2>
        <div class="modal__genres">
          <h3>Жанр:</h3>
          <p class="modal__genres-list">
            ${this.getGenresList()}
          </p>
        </div>
        <div>
          <h3>Рейтинг</h3>
          <span class="modal__rating">${this.vote_average}</span>
        </div>
        <div class="header__info">
          <h3 dir="auto">Обзор: </h3>
          <div class="overview" dir="auto">
            <p class="description">
            ${this.overview}
            </p>
          </div>
          <p class="modal__link-wrapper">
            ${this.getHomePage()}
          </p>
          <div class="modal__close"></div>
        </div>
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
