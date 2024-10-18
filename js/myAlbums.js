const username = window.localStorage.getItem('username');

const endpoint = '';

display();
async function display() {

    /* get user profile */
    const response = await fetch(endpoint + 'getuser?user=' + username);
    const data = await response.json();
    const user = data[0];

    /* title */
    document.getElementById("myAlbums-title").innerHTML = "Your " +  user.numAlbums + " Albums:"

    /* make tiers of the albums */
    const albums = JSON.parse(user.albums);
    makeTiers(albums);

    /* make gallery */
    const randomIds = randomizeIds(albums);
    displayGallery(albums, randomIds);
}

function makeTiers(albums) {

    const rankedContainer = document.getElementById('rowContainer');
    const unrankedRow = document.createElement('div');
    for (let id in albums) {

        const album = albums[id];
        const rank = album.album_ranking - 1;

        const cover = document.createElement('img');
        cover.src = album.cover_url;
    
        cover.addEventListener('click', function() {
            window.localStorage.setItem('albumSelected', id);
            window.location.href = '../html/viewAlbum.html'
        });

        if (rank > -1) {
            for (let i = rankedContainer.children.length; i <= rank; ++i) {
                const rowContainer = document.createElement('div');
                rowContainer.classList = 'rank-row';
                rankedContainer.appendChild(rowContainer);
            }
            rankedContainer.children[rank].appendChild(cover);
        } else {
            unrankedRow.appendChild(cover);
        }
    }

    /* check if unranked albums exist */
    if (unrankedRow.children.length > 0) {
        unrankedRow.classList = 'rank-row';
        unrankedRow.style.justifyContent = 'flex-start';
        document.getElementById('unranked-container').appendChild(unrankedRow);
        document.getElementById('unranked-title').innerHTML = "Unranked:";
    }
}

function randomizeIds(albums) {
    const ids = Object.keys(albums);
    for (let i = ids.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
}

/* put album covers */
function displayGallery(albums, randomIds) {
    const gallery = document.getElementById('gallery');
    randomIds.forEach(id => {
        const cover = document.createElement('img');
        cover.src = albums[id].cover_url;
        gallery.appendChild(cover);

        cover.addEventListener('click', function() {
            window.localStorage.setItem('albumSelected', id);
            window.location.href = '../html/viewAlbum.html'
        });
    });
}

function toggleClicked(option) {
    if (option == 'ranked') {
        document.getElementById("ranked-toggle").style.textDecoration = 'underline';
        document.getElementById("gallery-toggle").style.textDecoration = 'none';
        document.getElementById('galleryContainer').style.display = 'none';
        document.getElementById('rankedContainer').style.display = 'flex';
    } else {
        document.getElementById("gallery-toggle").style.textDecoration = 'underline';
        document.getElementById("ranked-toggle").style.textDecoration = 'none';
        document.getElementById('galleryContainer').style.display = 'flex';
        document.getElementById('rankedContainer').style.display = 'none';
    }
}
