const form = document.querySelector("#form");
const searchInput = document.querySelector("#search");
const songsContainer = document.querySelector("#songs-container");
const prevAndNextContainer = document.querySelector("#prev-and-next-container");

const apiURL = "https://api.lyrics.ovh";

const fetchData = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

const getMoreSongs = async (url) => {
  const data = await fetchData(`https://cors-anywhere.herokuapp.com/${url}`);
  insertSongsIntoPage(data);
};

const insertNextAndPrevButtons = ({ prev, next }) => {
  prevAndNextContainer.textContent = "";
  prevAndNextContainer.insertAdjacentHTML(
    "beforeend",
    `${
      prev
        ? `<button class="btn" onClick="getMoreSongs('${prev}')">Anteriores</button>`
        : ""
    }`
  );
  prevAndNextContainer.insertAdjacentHTML(
    "beforeend",
    `${
      next
        ? `<button class="btn" onClick="getMoreSongs('${next}')">Próximas</button>`
        : ""
    }`
  );
};

const insertSongsIntoPage = ({ data, prev, next }) => {
  const songsDisplay = data
    .map(
      ({ artist: { name }, title }) =>
        `<li class="song">
    <span class="song-artist"><strong>${name}</strong> - ${title}</span>
    <button class="btn" data-artist="${name}" data-song-title="${title}">Ver letra</button>
    </li>`
    )
    .join("");
  songsContainer.textContent = "";
  songsContainer.insertAdjacentHTML("beforeend", songsDisplay);

  if (prev || next) {
    insertNextAndPrevButtons({ prev, next });
    return;
  }
};

const fetchSongs = async (term) => {
  const data = await fetchData(`${apiURL}/suggest/${term}`);
  insertSongsIntoPage(data);
};

const handleFormSubmit = (event) => {
  event.preventDefault();

  const searchTerm = searchInput.value.trim();
  searchInput.value = "";
  searchInput.focus();

  if (!searchTerm) {
    songsContainer.insertAdjacentHTML(
      "afterbegin",
      `<li class="warning-message">Por favor, digite um termo válido</li>`
    );
    return;
  }

  fetchSongs(searchTerm);
};

form.addEventListener("submit", handleFormSubmit);

const insertLyricsIntoPage = ({ lyrics, artist, songTitle }) => {
  songsContainer.textContent = "";
  songsContainer.insertAdjacentHTML(
    "beforeend",
    `
  <li class="lyrics-container">
    <h2><strong>${songTitle}</strong> - ${artist}</h2>
    <p class="lyrics">${lyrics}</p>
  </li>
  `
  );
};

const fetchLyrics = async (artist, songTitle) => {
  const data = await fetchData(`${apiURL}/v1/${artist}/${songTitle}`);

  const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, "</br>");

  insertLyricsIntoPage({ lyrics, artist, songTitle });
};

const handleSongsContainerClick = (event) => {
  const clickedElement = event.target;

  if (clickedElement.tagName === "BUTTON") {
    const artist = clickedElement.getAttribute("data-artist");
    const songTitle = clickedElement.getAttribute("data-song-title");

    prevAndNextContainer.textContent = "";
    fetchLyrics(artist, songTitle);
  }
};

songsContainer.addEventListener("click", handleSongsContainerClick);
