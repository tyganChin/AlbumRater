const name = window.localStorage.getItem('username');

const endPoint = 'http://ec2-3-144-28-102.us-east-2.compute.amazonaws.com:3000/';

/* write name in top bar */
document.getElementById('name').innerText = "Welcome\n" + name;

/* add even listeners */
const topButtons = [
    ['topRecord', '../html/home.html'],
    ['myAlbums', '../html/myAlbums.html'],
    ['listeningList', '../html/listeningList.html'],
    ['browseMusic', '../html/browse.html'],
];

for (let i = 0; i < topButtons.length; ++i) {
    const button = document.getElementById(topButtons[i][0]);
    button.addEventListener('click', function() {
        window.location.href = topButtons[i][1];
    });
}

/* add search event listener */
const searchIcon = document.getElementById('searchImage');
searchIcon.addEventListener('click', function() {
    search(true);
});

const searchBox_album = document.getElementById('albumSearch');
const searchBox_artist = document.getElementById('artistSearch');
searchBox_album.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        search(false);
    }
});
searchBox_artist.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        search(false);
    }
});

function search(searchIconPressed) {
    const artistSearch = document.getElementById('artistSearch').value;
    const albumSearch = document.getElementById('albumSearch').value;
    
    if (artistSearch == '' && albumSearch == '') {
        if (searchIconPressed) {
            document.getElementById('error').innerText = "Input into at least 1 box";
        }
    } else {
        window.localStorage.setItem('artistSearch', artistSearch);
        window.localStorage.setItem('albumSearch', albumSearch);
        window.location.href = '../html/search.html';
    }
}

const settingsButton = document.getElementById('settingsImage');
const settingsMenu = document.getElementById('settingsBox');
settingsButton.addEventListener('click', function(event) {
    if (window.getComputedStyle(settingsMenu).display == 'none') {
        settingsMenu.style.display = 'flex';
        event.stopPropagation();
        document.addEventListener('click', handleClick);
    }
})

const blurScreen = document.getElementById('settings-blur');


const settingsTitle = document.getElementById('settingsTitle');
const userPassButton = document.getElementById('userPassButton');
const spotifyButton = document.getElementById('spotifyButton');
const issueButton = document.getElementById('issueButton');
const deleteButton = document.getElementById('deleteButton');
const logoutButton = document.getElementById('logoutButton');

var state = "";
function handleClick(event) {
    if (!settingsTitle.contains(event.target)) {
        if (userPassButton.contains(event.target)) {
            blurScreen.style.display = 'flex';
            document.getElementById('settings-popup-container').style.display = 'flex'
            document.getElementById('username-menu').style.display = 'flex'
            state = "userPass";
            document.getElementById('currentUsername').innerHTML = "Current Username: " +  profile.username;
        } else if (spotifyButton.contains(event.target)) {
            blurScreen.style.display = 'flex';
            document.getElementById('settings-popup-container').style.display = 'flex';
        } else if (issueButton.contains(event.target)) {
            blurScreen.style.display = 'flex';
            document.getElementById('settings-popup-container').style.display = 'flex'
        } else if (deleteButton.contains(event.target)) {
            blurScreen.style.display = 'flex';
            document.getElementById('settings-popup-container').style.display = 'flex'
            document.getElementById('delete-menu').style.display = 'flex'
            state = "delete";
        } else if (logoutButton.contains(event.target)) {
            localStorage.clear();
            window.location.href = '../html/index.html';
        }
        settingsMenu.style.display = 'none';
        document.removeEventListener('click', handleClick);
    }
}

const closeSettingsMenuButton = document.getElementById('closeSettingsMenuButton');
closeSettingsMenuButton.addEventListener('click', function() {
    blurScreen.style.display = 'none';
    document.getElementById('settings-popup-container').style.display = 'none';

    const menus = document.querySelectorAll('.settings-popup');
    menus.forEach(menu => {
        menu.style.display = 'none';
    })

    if (state == "userPass") {
        document.getElementById('error-message').innerText = '';
        document.getElementById('error-message1').innerText = '';
        document.getElementById('newUsername').value = '';
        document.getElementById('password').value = '';
        document.getElementById('oldPass').value = '';
        document.getElementById('newPass1').value = '';
        document.getElementById('newPass2').value = '';
    } else if (state == "delete") {
        document.getElementById('delete-menu').style.display = 'flex'
    }
});


const usernameToggle = document.getElementById('userChangeToggle');
const passwordToggle = document.getElementById('passChangeToggle');
usernameToggle.addEventListener('click', function() {
    passwordToggle.style.textDecoration = 'none'
    usernameToggle.style.textDecoration = 'underline';
    document.getElementById('userChange-body').style.display = 'flex';
    document.getElementById('passChange-body').style.display = 'none';
})
passwordToggle.addEventListener('click', function() {
    passwordToggle.style.textDecoration = 'underline'
    usernameToggle.style.textDecoration = 'none';
    document.getElementById('userChange-body').style.display = 'none';
    document.getElementById('passChange-body').style.display = 'flex';
})

async function changeUsername() {

    try {
        /* get username and password */
        const newUsername = document.getElementById('newUsername').value;
        const password = document.getElementById('password').value;

        /* check valid password */
        if (password != profile.password) {
            throw new Error('Incorrect Password');
        }
        
        /* check if username already exists */
        const response1 = await fetch(endPoint + 'getuser?user=' + newUsername);
        const data1 = await response1.json();
        if (Object.keys(data1).length == 1) {
            throw new Error('Username Taken: Try a New One');
        }
        
        /* update database */
        await fetch(endPoint + 'newUsername?olduser=' + profile.username + "&newuser=" + newUsername);
        profile.username = newUsername;
        window.localStorage.setItem('profile', JSON.stringify(profile));

        /* update top bar */
        document.getElementById('name').innerText = "Welcome\n" + profile.username;

        /* clear menu */
        closeSettingsMenuButton.click();
    } catch (error) {
        document.getElementById('error-message').innerText = error.message;
    }

}

async function changePassword() {

    try {
        /* get username and password */
        const oldPassword = document.getElementById('oldPass').value;
        const newPassword1 = document.getElementById('newPass1').value;
        const newPassword2 = document.getElementById('newPass2').value;

        /* check valid password */
        if (oldPassword != profile.password) {
            throw new Error('Incorrect Password');
        } else if (newPassword1 != newPassword2) {
            throw new Error('Passwords Do Not Match');
        }   
        console.log(newPassword1 + " " + newPassword2)
        /* update database */
        await fetch(endPoint + 'newPassword?user=' + profile.username + "&newPass=" + newPassword1);
        profile.password = newPassword1;
        window.localStorage.setItem('profile', JSON.stringify(profile));

        /* clear menu */
        closeSettingsMenuButton.click();
    } catch (error) {
        document.getElementById('error-message1').innerText = error.message;
    }

}

async function deleteAccount() {
    await fetch(endPoint + 'deleteAccount?user=' + profile.username);
    localStorage.clear();
    window.location.href = '../html/index.html';
}