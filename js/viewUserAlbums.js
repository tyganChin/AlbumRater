const endpoint = '';

display();
async function display() {

    const response = await fetch(endpoint + 'getuser?user=' + window.localStorage.getItem('userSelected'));
    const data = await response.json();
    const user = data[0];
    console.log(user);
    const albums = JSON.parse(user.albums);
    const tiers = rank(albums);
    console.log(albums);


    const title = document.getElementById("myAlbums-title");
    title.innerHTML = user.username + "'s " +  user.numAlbums + " Albums:"
    
    const rankedContainer = document.getElementById('rowContainer');
    for (let i = 1; i < tiers.length; ++i) {
        /* create row container */
        const rowContainer = document.createElement('div');
        rowContainer.classList = 'rank-row';
    
        tiers[i].forEach(album => {
            const cover = document.createElement('img');
            cover.src = album[1].cover_url;
            rowContainer.appendChild(cover);
        
        });
    
        rankedContainer.append(rowContainer);
    }
    
    if (tiers.length > 0 && tiers[0].length > 0) {
        const unrankedRow = document.createElement('div');
        unrankedRow.classList = 'rank-row';
        unrankedRow.style.justifyContent = 'flex-start';
        tiers[0].forEach(album => {
            const cover = document.createElement('img');
            cover.src = album[1].cover_url;
            unrankedRow.appendChild(cover);
    
        })
        document.getElementById('unranked-container').appendChild(unrankedRow);
    
        document.getElementById('unranked-title').innerHTML = "Unranked:";
    }
    
    /* put album covers */
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    for (let id in albums) {
        const cover = document.createElement('img');
        cover.src = albums[id].cover_url;
        gallery.appendChild(cover);
    }
    
    document.getElementById("gallery-toggle").addEventListener('click', function() {
        document.getElementById("gallery-toggle").style.textDecoration = 'underline';
        document.getElementById("ranked-toggle").style.textDecoration = 'none';
    
        document.getElementById('galleryContainer').style.display = 'flex';
        document.getElementById('rankedContainer').style.display = 'none';
    });
    
    document.getElementById("ranked-toggle").addEventListener('click', function() {
        document.getElementById("ranked-toggle").style.textDecoration = 'underline';
        document.getElementById("gallery-toggle").style.textDecoration = 'none';
        
        document.getElementById('galleryContainer').style.display = 'none';
        document.getElementById('rankedContainer').style.display = 'flex';
    });
}


function rank(albums) {

    const tiers = [[]];
    for (let id in albums) {
        const album = albums[id];
        const rank = album.album_ranking;
        for (let i = tiers.length; i <= rank; ++i) {
            tiers[i] = [];
        }
        tiers[rank].push([id, album]);
    }
    return tiers;
}

function back() {
    history.back();
}

