const user = JSON.parse(window.localStorage.getItem('profile'));
const albums = JSON.parse(user.listenList);

const endpoint = 'http://ec2-3-144-28-102.us-east-2.compute.amazonaws.com:3000/';

const username = window.localStorage.getItem('username');

display();
async function display() {

    /* get user profile */
    const response = await fetch(endpoint + 'getuser?user=' + username);
    const data = await response.json();
    const user = data[0];
    
    const albums = JSON.parse(user.listenList);
    const gallery = document.getElementById('gallery');
    for (let id in albums) {
        const cover = document.createElement('img');
        cover.src = albums[id]
        gallery.appendChild(cover);

        cover.addEventListener('click', function() {
            window.localStorage.setItem('albumSelected', id);
            window.location.href = '../html/viewAlbum.html'
        });
    }

}