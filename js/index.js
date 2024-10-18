const endpoint = 'https://ec2-3-144-28-102.us-east-2.compute.amazonaws.com:3000/';

/* play audio when screen is clicked */
document.addEventListener('click', function(event) {
    document.getElementById('backgroundAudio').play();
});


async function attempt(action) {
    try {
        await action();
    } catch (error) {
        document.getElementById('error-message').innerText = error.message;
    }
}

async function signIn() {

    /* get username and password */
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
  
    /* attempt to log in  */
    const response = await fetch(endpoint + 'getuser?user=' + username);
    const data = await response.json();
    if (Object.keys(data).length == 0 || data[0].password != password) {
        throw new Error('Incorrect Username or Password');
    }

    const unranked = await getUnrankedAlbums(JSON.parse(data[0].albums));

    /* set local storage */
    window.localStorage.setItem('unranked', JSON.stringify(unranked));
    window.localStorage.setItem('username', username);

    /* go to home page */
    window.location.href = 'html/home.html';
}

async function createAcc() {

    /* get username and password */
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password1').value;
    const passwordCopy = document.getElementById('signup-password2').value;
    
    /* check if username already exists */
    const response1 = await fetch(endpoint + 'getuser?user=' + username);
    const data1 = await response1.json();
    if (Object.keys(data1).length == 1) {
        throw new Error('Username Taken: Try a New One');
    } else if (password != passwordCopy) {
        throw new Error('Passwords do not match');
    }
    
    await fetch(endpoint + 'newuser?user=' + username + '&pass=' + password);

    /* go to home page */
    window.localStorage.setItem('unranked', JSON.stringify([]));
    window.localStorage.setItem('username', username);
    window.location.href = 'html/home.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const oopsButtons = document.getElementsByClassName('noAccount-or-account');

    for (let i = 0; i < oopsButtons.length; ++i) {
        oopsButtons[i].addEventListener('click', function() {
            if (document.getElementById('login').style.display == 'flex') {
                goTo('login', 'createAcc');
            } else {
                goTo('createAcc', 'login');
            }
        });
    }
});


function goTo(from, to) {
    document.getElementById(from).style.display = 'none';
    document.getElementById(to).style.display = 'flex';
}

async function getUnrankedAlbums(albums) {
    var unrankedAlbumIds = '';
    for (let id in albums) {
        if (albums[id].album_ranking == 0) {
            unrankedAlbumIds += id + ",";
        }
    }

    if (unrankedAlbumIds.length == 0) {
        return {};
    }

    const unrankedAlbums = await getAlbums(unrankedAlbumIds.slice(0, -1))
    const unranked = {};
    unrankedAlbums.forEach(album => {
        var artists = "";
        album.artists.forEach(artistProfile => {
            artists += artistProfile.name + ", "
        })
        unranked[album.id] = {album: album.name, artist: artists.slice(0, -2)}
    });
    
    return unranked;
}

const clientID = '1036f292de2741b884a6b6e3769957a3';
const clientSecret = 'ffab91a93139428cbde25ab5206464c7';

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
async function getAlbums(albumIds) {
    const token = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/albums?ids=${albumIds}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    const data = await response.json();

    return data.albums;
}
