const artistSearch = window.localStorage.getItem('artistSearch');
const albumSearch = window.localStorage.getItem('albumSearch');

var searchPages = [];

function displayPage(pageNum, pages) {

    /* scroll to top */
    window.scrollTo(0, 0);

    /* change results shown */
    const pageContainer = document.getElementById('results-container');
    pageContainer.innerHTML = '';
    pageContainer.appendChild(searchPages[pageNum - 1]);

    /* update page index */
    var begining = ((pageNum - 1) * 10) + 1;
    var end = Math.min(pageNum * 10, pages.length);
    document.getElementById('search-index').innerHTML = begining + " - " + end + " / " + pages.length;

    /* ensure page is at bottom of the screen */
    document.getElementById('result-pager').style.bottom = '0';
}

run();
async function run() {
    const token = await getToken();
    const title = document.getElementById('search-title');
    var results = [];
    if (artistSearch == '') {
        title.innerHTML += albumSearch;
        results = await searchAlbum(token, encodeURIComponent(albumSearch));
    } else if (albumSearch == '') {
        title.innerHTML += artistSearch;
        const artistIds = await searchArtist(token, encodeURIComponent(artistSearch));
        results = await getArtistAlbums(token, artistIds);
    } else {
        title.innerHTML += albumSearch + " by " + artistSearch;
        const query = `artist:${encodeURIComponent(artistSearch)} album:${encodeURIComponent(albumSearch)}`;
        results = await searchAlbum(token, query)
    }

    searchPages = makePages(results);
    createPager(results);
}

/* makes each search page */
function makePages(albums) {
    const searchPages = [];
    for (let i = 0; i < albums.length; i += 10) {

        /* create a new page */
        const page = document.createElement('div');
        page.classList = 'results';

        var max = Math.min(i + 10, albums.length);
        for (let j = i; j < max; ++j) {

            /* create new instance of result */
            const result = document.createElement('div');
            result.classList = 'albumResult'

            /* add image */
            const cover = document.createElement('img');
            cover.src = albums[j].images[0].url;
            result.appendChild(cover);

            /* add title and artist */
            const titleContainer = document.createElement('div');
            titleContainer.classList = 'albumResult-title-container'

            /* title */
            const title = document.createElement('div');
            title.classList = 'albumResult-title'
            title.innerHTML = albums[j].name;
            titleContainer.appendChild(title);
            
            /* artist */
            const artistName = document.createElement('div');
            artistName.classList = 'albumResult-artist';
            var artists = " By ";
            albums[j].artists.forEach(artistProfile => {
                artists += artistProfile.name + ", "
            })
            artistName.innerHTML = artists.slice(0, -2);
            titleContainer.appendChild(artistName);

            result.appendChild(titleContainer);

            // const addButtons = document.createElement('div');
            // addButtons.classList = 'albumResult-add-container';
            // if (userAlbums[albums[j].id] == undefined) {
            //     const rankButton = document.createElement('button');
            //     rankButton.innerHTML = "Add Album";
            //     rankButton.onclick = 
            //     addButtons.appendChild(rankButton);
            //     if (listenList[albums[j].id] == undefined) {
            //         const listenListButton = document.createElement('button');
            //         listenListButton.innerHTML = "Listen List";
            //         addButtons.appendChild(listenListButton);
            //     }
            // } else {
            //     const rank = document.createElement('div');
            //     rank.classList = 'rank';
            //     if (userAlbums[albums[j].id].album_ranking > 0) {
            //         rank.innerHTML = "Rank:" + userAlbums[albums[j].id].album_ranking;
            //     } else {
            //         rank.innerHTML = "Unranked";
            //     }
            //     addButtons.appendChild(rank);
            // }

            // result.appendChild(addButtons)
            

            /* add button to search box */
            result.addEventListener('click', function() {
                window.localStorage.setItem('albumSelected', albums[j].id);
                window.location.href = '../html/viewAlbum.html' 
            })

            page.appendChild(result);
        }
        searchPages.push(page);
    }
    return searchPages;
}

/* search pager */
function createPager(pages) {
    if (pages.length > 10) {
        var numPages = Math.ceil(pages.length / 10);
        const pageContainer = document.getElementById('result-pager');
        for (let i = 1; i <= numPages; ++i) {
            const newPage = document.createElement('div');
            newPage.classList = 'result-page';
            newPage.innerHTML = i;
            newPage.addEventListener('click', function() {
                /* reset pages */
                document.querySelectorAll('.result-page').forEach(page => {
                    page.style.fontSize = '1.35vw';
                    page.style.fontWeight = 'normal';
                });
    
                /* bold new page */
                newPage.style.fontWeight = 'bold';
                newPage.style.fontSize = `${parseFloat(window.getComputedStyle(newPage).fontSize) + 6}px`;
    
                /* create new page */
                displayPage(i, pages);
            })
            pageContainer.appendChild(newPage);
        }
        pageContainer.firstChild.click();
    } else {
        displayPage(1, pages);
    }
}


/* method to get the original token */
async function getToken() {

    const clientID = '';
    const clientSecret = '';

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientID + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await result.json();
    return data.access_token;
}

/* searches for album name and returns array of albums */
async function searchAlbum(token, album) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${album}&type=album&limit=50`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    const data = await response.json();

    let albums = [];
    data.albums.items.forEach(element => {
        if (element.album_type == "album") {
            albums.push(element);
        }
    })

    return albums
}

/* gets the id of the artists with the 5 closest matches to the search */
const artistlimit = 5;
async function searchArtist(token, artist) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=${artistlimit}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    const data = await response.json();

    const ids = [];
    data.artists.items.forEach(artist => {
        ids.push(artist.id)
    })

    return ids;
}

async function getArtistAlbums(token, artistIds) {
    /* get albums from the searched artist */
    const promises = artistIds.map(async (id) => {
        const response = await fetch(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album`, {
            headers: {
              'Authorization': 'Bearer ' + token
            }
        });
        const data = await response.json();
        return data.items;
    });
    const results = await Promise.all(promises);

    /* make into single array */
    const albumArray = [];
    results.forEach(artist => {
        artist.forEach(artistAlbum => {
            albumArray.push(artistAlbum);
        })
    })

    return albumArray;
}


