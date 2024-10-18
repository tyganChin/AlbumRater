async function attempt(action) {
    try {
        await action();
    } catch (error) {
        document.getElementById('error-message').innerText = error.message;
    }
}

async function signIn() {

    /* get username and password */
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    /* attempt to log in  */
    const response = await fetch('http://localhost:3000/getuser?user=' + username);
    const data = await response.json();
    if (Object.keys(data).length == 0 || data[0].password != password) {
        throw new Error('Incorrect Username or Password');
    }

    /* go to home page */
    window.localStorage.setItem('profile', JSON.stringify(data[0]));
    window.location.href = 'home.html';
}

async function createAcc() {

    /* get username and password */
    const username = document.getElementById('username').value;
    const password = document.getElementById('password1').value;
    const passwordCopy = document.getElementById('password2').value;
    
    /* check if username already exists */
    const response = await fetch('http://localhost:3000/getuser?user=' + username);
    const data = await response.json();
    if (Object.keys(data).length == 1) {
        throw new Error('Username Taken: Try a New One');
    } else if (password != passwordCopy) {
        throw new Error('Passwords do not match');
    } else {
        await fetch('http://localhost:3000/newuser?user=' + username + '&pass=' + password);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const buttonText = document.getElementById('noAccount');

    buttonText.addEventListener('click', () => {
        if (window.location.pathname.split("/").pop() == 'login.html') {
            window.location.href = 'createAccount.html';
        } else {
            window.location.href = 'login.html';
        }
    });
});

// Load saved playback position
window.addEventListener('load', () => {
    const audio = document.getElementById('backgroundAudio')
    const savedTime = localStorage.getItem('backgroundAudio');
    if (savedTime) {
        audio.currentTime = savedTime;
        audio.play(); // Automatically play if desired
    }
});


