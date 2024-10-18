const username = window.localStorage.getItem('username');
const unranked = JSON.parse(window.localStorage.getItem('unranked'))
console.log(unranked);
var user = undefined;
var albums = undefined;

const endpoint = '';


display();

async function display() {

    /* get user profile */
    const response = await fetch(endpoint + 'getuser?user=' + username);
    const data = await response.json();
    user = data[0];
    console.log(user);

    /* add profile picture and banner */
    const bannerImg = document.getElementById('bannerImg');
    bannerImg.style.transform = 'translateY(' + user.bannerPos + 'px)';
    await setProfilePic(user);
    if (user.banner != undefined) {
        bannerImg.src = user.banner;
        console.log(user.banner);
    }

    /* display number of albums listened to */
    document.getElementById('numAlbums').innerHTML = user.numAlbums + " Albums Ranked";

    /* top album */
    albums = JSON.parse(user.albums);
    topAlbum(albums)

    /* albums */
    displayAlbums(albums);
    displayListenList(JSON.parse(user.listenList));

    /* to rank list */
    toRank(albums);

    /* spotfy */
    
    /* home page edit */
    await makeBannerGallery(albums)

    document.getElementById('loadingScreen').style.display = 'none';
}

async function setProfilePic(user) {
    const profilePic = document.getElementById('profileImage');
    if (user.pic != null) {
        const response = await fetch(endpoint + 'getPic?user=' + encodeURIComponent(username));
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        profilePic.src = data.image;
    } else {
        profilePic.src = '../images/default.png';
    }
}

/* display top album or one of top albums */
const topAlbum_container = document.getElementById('topAlbum-container');
const topAlbum_title = document.getElementById('topAlbum-title');
function topAlbum(albums) {
    topAlbum_title.innerHTML = "Top Album";

    const topAlbums = [];
    for (let id in albums) {
        if (albums[id].album_ranking == 1) {
            topAlbums.push(albums[id].cover_url);
        }
    }

    if (topAlbums.length > 0) {
        var length = Math.min(5, topAlbums.length);
        for (let i = 0; i < length; ++i) {
            const topAlbum = document.createElement('div');
            topAlbum.classList = 'topAlbum';
            topAlbum.style.width = (100 / length) + "%";
            
            const cover = document.createElement('img');
            cover.src = topAlbums[i];
            topAlbum.appendChild(cover);

            if (i == 0) {
                topAlbum.style.borderTopLeftRadius = '8px';
                topAlbum.style.borderBottomLeftRadius = '8px';
            }
            if (i == length - 1) {
                topAlbum.style.borderTopRightRadius = '8px';
                topAlbum.style.borderBottomRightRadius = '8px';
            }

            topAlbum_container.appendChild(topAlbum);
        }

        if (length > 1) {
            topAlbum_title.innerHTML = "Top Albums";
        }
    } else {
        topAlbum_container.src = '../images/recordLoop.gif'
    }    
}

/* populate myalbums */
async function displayAlbums(albums) {

    /* get container */
    const albumList = document.getElementById('albumList');
    const albumIds = Object.keys(albums);

    var randomizedAlbums = {};
    while (Object.keys(randomizedAlbums).length < Math.min(5, albumIds.length)) {
        const randomKey = albumIds[Math.floor(Math.random() * albumIds.length)];
        if (randomizedAlbums[randomKey] == undefined && albums[randomKey].cover_url != topAlbum_container.src) {
            randomizedAlbums[randomKey] = albums[randomKey].cover_url;
        }
    }

    /* add albums */
    for (let id in randomizedAlbums) {
        const cover = document.createElement('img');
        cover.src = randomizedAlbums[id];
        cover.classList = 'albumImage'

        cover.addEventListener('click', function() {
            window.localStorage.setItem('albumSelected', id);
            window.location.href = '../html/viewAlbum.html'
        });

        albumList.appendChild(cover);
    }

    /* fill in if not enough albums */
    for (let i = 0; i < 5 - albumIds.length; ++i) {
        const resDiv = document.createElement('img');
        resDiv.src = '../images/recordLoop.gif'
        resDiv.classList = 'albumImage'
        albumList.appendChild(resDiv);
    }
}

/* populate myalbums */
async function displayListenList(albums) {

    /* get container */
    const albumList = document.getElementById('listenList');
    const albumIds = Object.keys(albums);

    var randomizedAlbums = {};
    while (Object.keys(randomizedAlbums).length < Math.min(5, albumIds.length)) {
        const randomKey = albumIds[Math.floor(Math.random() * albumIds.length)];
        if (randomizedAlbums[randomKey] == undefined) {
            randomizedAlbums[randomKey] = albums[randomKey];
        }
    }
    
    /* fill in if not enough albums */
    for (let i = 0; i < 5 - albumIds.length; ++i) {
        const resDiv = document.createElement('img');
        resDiv.src = '../images/recordLoop.gif'
        resDiv.classList = 'albumImage'
        albumList.appendChild(resDiv);
    }

    /* add albums */
    for (let id in randomizedAlbums) {
        const cover = document.createElement('img');
        cover.src = randomizedAlbums[id];
        cover.classList = 'albumImage'

        cover.addEventListener('click', function() {
            window.localStorage.setItem('albumSelected', id);
            window.location.href = '../html/viewAlbum.html'
        });

        albumList.appendChild(cover);
    }
}

function toRank(albums) {
    const toRankContainer = document.getElementById('toRank-container')
    var count = 0;
    for (let id in unranked) {

        const albumContainer = document.createElement('div');
        albumContainer.classList = 'toRank';

        const cover = document.createElement('img');
        cover.src = albums[id].cover_url;
        albumContainer.append(cover);

        const titleContainer = document.createElement('div');
        titleContainer.classList = 'toRank-title-container';

        const title = document.createElement('div');
        title.classList = 'toRank-album'
        title.innerHTML = unranked[id].album;
        titleContainer.appendChild(title);

        const artist = document.createElement('div');
        artist.classList = 'toRank-artist'
        artist.innerHTML = unranked[id].artist;
        titleContainer.appendChild(artist);

        albumContainer.appendChild(titleContainer);

        albumContainer.addEventListener('click', function() {
            window.localStorage.setItem('albumSelected', id);
            window.location.href = '../html/viewAlbum.html'
        })

        toRankContainer.appendChild(albumContainer);
        
        ++count;
        if (count == 5) {
            albumContainer.style.borderBottom = 'none';
            break;
        }
    }
}

/* open and close spotify menu functions */
const blur = document.getElementById('blur');
const spotifyMenu = document.getElementById('spotify-menu');
function openSpotifyMenu() {
    blur.style.display = 'flex';
    spotifyMenu.style.display = 'flex';
}
function closeSpotifyMenu() {
    blur.style.display = 'none';
    spotifyMenu.style.display = 'none';
}

function spotifyLoginClicked() {
    window.location.href = 'https://accounts.spotify.com/authorize?client_id=' + clientID + '&response_type=code&redirect_uri=' + encodeURIComponent('http://tyganc.sgedu.site/html/home.html') + '&scope=user-read-recently-played';
}

function makeBannerGallery(albums) {
    /* print albums */
    const gallery = document.getElementById('bannerMenuAlbum-gallery');
    gallery.innerHTML = '';
    Object.values(albums).forEach(album => {
        const cover = document.createElement('img');
        cover.src = album.cover_url;
        gallery.appendChild(cover);

        cover.addEventListener('click', async function() {
            document.getElementById('bannerImg').src = album.cover_url;
            const params = new URLSearchParams({
                user: username,
                banner: album.cover_url
            });
            await fetch(endpoint + 'setBanner?' + params.toString());
        });
    });
}

const changeBanner = document.getElementById('changeBanner');
const bannerEdit = document.getElementById('bannerEdit');
function bannerEditButtonClicked(event) {
    if (bannerEdit.style.display != 'flex') {
        event.stopPropagation();
        bannerEdit.style.display = 'flex';
        document.getElementById('bannerImg').style.opacity = '0.5';
        document.getElementById('profileImage').style.filter = 'blur(7px)';
        document.getElementById('cameraIcon').style.display = 'flex';
        document.addEventListener('click', bannerEditAction);
    }
}
function bannerEditAction(event) {
    if (!changeBanner.contains(event.target) && !upArrow.contains(event.target) && !downArrow.contains(event.target) && !cameraIcon.contains(event.target) && !fileInput.contains(event.target)) {
        bannerEdit.style.display = 'none';
        document.getElementById('bannerImg').style.opacity = '1';
        document.getElementById('profileImage').style.filter = 'blur(0px)';
        document.getElementById('cameraIcon').style.display = 'none';
        document.removeEventListener('click', bannerEditAction);
    }
}

const bannerContainer = document.getElementById('banner').getBoundingClientRect();
const bannerImg = document.getElementById('bannerImg')
function adjustBanner(amount) {

    /* get current banner pos */
    const transformValue = window.getComputedStyle(bannerImg).transform;
    console.log(transformValue);
    const matrixValues = transformValue.match(/matrix\(([^)]+)\)/)[1].split(', ');
    var bannerPos = parseFloat(matrixValues[5]);

    /* update position */
    bannerPos += amount;
    bannerImg.style.transform = 'translateY(' + bannerPos + 'px)';

    /* check to make sure banner is in bounds */
    const img = bannerImg.getBoundingClientRect();
    if (img.top > bannerContainer.top) {
        bannerPos -= img.top - bannerContainer.top;
        bannerImg.style.transform = 'translateY(' + bannerPos + 'px)';
    } else if (img.bottom < bannerContainer.bottom) {
        bannerPos += bannerContainer.bottom - img.bottom;
        bannerImg.style.transform = 'translateY(' + bannerPos + 'px)';
    }

    /* update bannerPos in database */
    const params = new URLSearchParams({
        user: username,
        bannerPos: bannerPos
    });
    fetch(endpoint + 'setBannerPos?' + params.toString());
}

const fileInput = document.getElementById('changeProfilePic');
function clickFileInput() {
    fileInput.click();
}

function updateProfilePic() {

    /* get image and check if it's valid */
    const file = fileInput.files[0];
    if (!file) {
        return
    }

    /* read in profile picuture and update database with it */
    const reader = new FileReader();
    reader.onload = function(e) {

        /* change pic on website */
        const base64Data = e.target.result;
        document.getElementById('profileImage').src = base64Data;

        /* set profile pic in database */
        fetch(endpoint + 'setProfilePic?user=' + encodeURIComponent(username), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64Data })
        })            
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        })
        .catch(error => console.error('Error:', error));
    };
    reader.readAsDataURL(file);
};

/* change banner */
const bannerMenu = document.getElementById('changeBannerMenu');
function changeBannerButtonClicked(event) {
    if (window.getComputedStyle(bannerMenu).display == 'none') {
        bannerMenu.style.display = 'flex';
        document.removeEventListener('click', bannerEditAction)
        event.stopPropagation();
        document.addEventListener('click', handleMenuClick);
    }
}

const gallerySearch = document.getElementById('bannerMenuAlbum-search-gallery')
const gallery = document.getElementById('bannerMenuAlbum-gallery');
async function bannerSearch() {

    /* check if search query has been inputted */
    const albumName = document.getElementById('bannerSearch').value;
    if (albumName == '') {
        return;
    }

    /* hide gallery results */
    gallery.style.display = 'none';
    gallerySearch.style.display = 'flex';
    cancelSearchButton.style.display = 'flex'

    gallerySearch.innerHTML = '';
    const results = await searchAlbum(albumName);
    
    results.forEach(album => {
        if (albums[album.id] != undefined) {
            const cover = document.createElement('img');
            cover.src = albums[album.id].cover_url;
            cover.style.width = '20%';
            cover.style.height = 'auto';
            gallerySearch.appendChild(cover);
        
            cover.addEventListener('click', async function() {
                document.getElementById('bannerImg').src = albums[album.id].cover_url;
                const params = new URLSearchParams({
                    user: username,
                    banner: albums[album.id].cover_url
                });
                await fetch(endpoint + 'setBanner?' + params.toString());
            });
        }
    })
}

const cancelSearchButton = document.getElementById('searchBox-X');
function cancelSearch() {
    /* hide search results */
    gallery.style.display = 'flex';
    gallerySearch.style.display = 'none';
    cancelSearchButton.style.display = 'none';

    /* clear search */
    document.getElementById('bannerSearch').value = '';
}

/* exits banner menu if elsewhere is clicked */
function handleMenuClick(event) {

    if (!bannerMenu.contains(event.target) && !upArrow.contains(event.target) && !downArrow.contains(event.target)) {
        bannerMenu.style.display = 'none';
        document.removeEventListener('click', handleMenuClick);
        document.addEventListener('click', bannerEditAction)
    }
};

function goTo(page) {
    window.location.href = page;
}


/************************************************************************************************************/
/*                                            Spotify Funcs                                                 */
/************************************************************************************************************/

const clientID = '';
const clientSecret = '';

/* method to get the original token */
async function getToken() {

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
async function searchAlbum(album) {
    const token = await getToken();
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
