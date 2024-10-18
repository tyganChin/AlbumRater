const endpoint = '';

otherUsers();
async function otherUsers() {
    const response = await fetch(endpoint + 'getUsers');
    const otherUsers = await response.json();
    console.log(otherUsers);

    const userContainer = document.getElementById('results-container');
    otherUsers.forEach(async user => {
        /* create new instance of user */
        const result = document.createElement('div');
        result.classList = 'user'
    
        /* add image */
        const coverContainer = document.createElement('div');
        coverContainer.classList = 'profileImg';
        const cover = document.createElement('img');
        cover.src = await getProfilePic(user);
        coverContainer.appendChild(cover);
        result.appendChild(coverContainer);
    
        /* useranme */
        const username = document.createElement('div');
        username.classList = 'username'
        username.innerHTML = user.username;
        result.appendChild(username);

        /* num albums */
        const numAlbums = document.createElement('div');
        numAlbums.classList = 'num-albums';
        numAlbums.innerHTML = user.numAlbums;
        result.appendChild(numAlbums)


        /* albums */
        const userAlbums = JSON.parse(user.albums);
        var count = 0;
        for (let id in userAlbums) {
            if (count == 4) {
                break;
            }
            const cover = document.createElement('img');
            cover.src = userAlbums[id].cover_url;
            result.appendChild(cover);
            ++count;
        }

        for (let i = count; i < 4; ++i) {
            const cover = document.createElement('img');
            cover.src = '../images/recordLoop.gif';
            cover.style.border = '1px solid white';
            result.appendChild(cover);
        }

        /* add button to search box */
        result.addEventListener('click', function() {
            window.localStorage.setItem('userSelected', user.username);
            window.location.href = '../html/viewUserAlbums.html';
        })
    
        userContainer.appendChild(result);
    });

}

async function getProfilePic(profile) {
    if (profile.pic != null) {
        const response = await fetch(endpoint + 'getPic?user=' + encodeURIComponent(profile.username));
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json(); // Parse the response as JSON
        return data.image
    } else {
        return '../images/default.png'; // Set the image source
    }
}
