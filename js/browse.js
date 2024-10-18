const genres = ["pop", "hip-hop","country", "rock-n-roll"];
genres.forEach(genre => {
    addCategory(genre);
})

newReleases();
async function newReleases() {
    const newRels = await getNewReleases();
    console.log(newRels);

    var newAlbums = [];
    newRels.forEach(album => {
        if (album.album_type == "album") {
            newAlbums.push(album);
        }
    });
    console.log(newAlbums);

    const category = document.createElement('div');
    category.classList = 'category';

    /* title */
    const title = document.createElement('div');
    title.classList = 'category-title';
    title.innerHTML = "new releases";
    category.appendChild(title);

    const gallery = document.createElement('div');
    gallery.classList = 'album-gallery';

    for (let i = 0; i < newAlbums.length; ++i) {
        const cover = document.createElement('img');
        cover.src = newAlbums[i].images[0].url;
    
        cover.addEventListener('click', function() {
            window.localStorage.setItem('albumSelected', newAlbums[i].id)
            window.location.href = '../html/viewAlbum.html' 
        });

        gallery.appendChild(cover);
    }
    category.appendChild(gallery);

    categoryContainer.appendChild(category);
}


const categoryContainer = document.getElementById('category-container');
async function addCategory(genre) {
    const recs = await getRecommendations(genre);

    const category = document.createElement('div');
    category.classList = 'category';

    /* title */
    const title = document.createElement('div');
    title.classList = 'category-title';
    title.innerHTML = genre;
    category.appendChild(title);

    /* albums */
    var recAlbums = [];
    recs.forEach(rec => {
        if (rec.album.album_type == "ALBUM") {
            recAlbums.push(rec.album);
        }
    });

    const gallery = document.createElement('div');
    gallery.classList = 'album-gallery';

    for (let i = 0; i < recAlbums.length; ++i) {
        const cover = document.createElement('img');
        cover.src = recAlbums[i].images[0].url;
    
        cover.addEventListener('click', function() {
            window.localStorage.setItem('albumSelected', recAlbums[i].id)
            window.location.href = '../html/viewAlbum.html' 
        });

        gallery.appendChild(cover);
    }
    category.appendChild(gallery);

    categoryContainer.appendChild(category);
}



async function getRecommendations(genre) {
    const token = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/recommendations?seed_genres=${genre}&min_popularity=70&limit=50`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data.tracks;
}

async function getNewReleases() {
    const token = await getToken();
    const response = await fetch('https://api.spotify.com/v1/browse/new-releases?limit=50', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data.albums.items;
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
