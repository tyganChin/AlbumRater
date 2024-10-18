/* fetches the spotify token to use at the endpoints */
/* this if function is an IIFE meaning it will execute as soon as it is declared */


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
    console.log(data.access_token);
}

getToken();