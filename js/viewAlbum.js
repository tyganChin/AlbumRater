const username = window.localStorage.getItem('username');
const unranked = JSON.parse(window.localStorage.getItem('unranked'));

const endpoint = 'http://ec2-3-144-28-102.us-east-2.compute.amazonaws.com:3000/';

var user = undefined;
var userAlbums = undefined;
var album = undefined;


main();
async function main() {

    /* get user profile */
    const response = await fetch(endpoint + 'getuser?user=' + username);
    const data = await response.json();
    user = data[0];
    userAlbums = JSON.parse(user.albums);

    page();
}

const pageStack = [];
function page() {
    if (pageStack.length == 0) {
        display(window.localStorage.getItem('albumSelected'))
    } else {
        display(pageStack[pageStack.length - 1]);
    }
}

async function display(id) {
    /* display loading screen */
    document.getElementById('loadingScreen').style.display = 'flex';
    
    /* get album information */
    album = await getAlbum(id);
    console.log(userAlbums[album.id] - 1);
    
    /* cover art */
    document.getElementById("albumCover").src = album.images[0].url;

    /* title and artist */
    titleAndArtist(album);

    /* release date */
    document.getElementById("released").innerHTML = "Released: " + album.release_date;

    /* ranked date */
    document.getElementById("label").innerHTML = "Label: " + album.label;

    /* popularity */
    document.getElementById("popularity").innerHTML = "Popularity: " + album.popularity;

    /* get album length */
    const tracklist = album.tracks.items;
    document.getElementById("length").innerHTML = "Length: " +  getLength(tracklist);

    /* rank or add buttons */
    rankButtons()

    /* display tracks */
    displayTracks(tracklist);
 
    /* options menu */
    updateOptionsMenu(userAlbums[id]);
  
    /* ranked tracks container */
    rankedTracks();
 
    /* recomendations */
    await displayRecomendations(tracklist)
    
    /* hide loading screen */
    document.getElementById('loadingScreen').style.display = 'none';
}

function getLength(tracklist) {
    var albumLength = 0;
    for (let i = 0; i < tracklist.length; ++i) {
        albumLength += Math.trunc(tracklist[i].duration_ms / 1000);
    }
    console.log(albumLength);

    var lengthString = "";

    /* hours */
    if (albumLength / 3600 > 1) {
        lengthString += numToString(Math.trunc(albumLength / 3600)) + ":"
        albumLength %= 3600;
    } else {
        lengthString += "00:"
    }

    /* minutes */
    if (albumLength / 60 > 1) {
        lengthString += numToString(Math.trunc(albumLength / 60)) + ":";
        albumLength %= 60;
    } else {
        lengthString += "00:"
    }

    /* seconds */
    if (albumLength % 60 > 0) {
        lengthString += numToString(Math.trunc(albumLength % 60));
    } else {
        lengthString += "00"
    }
    return lengthString;
}

function numToString(num) {
    if (num < 10) {
        return "0" + num;
    }
    return num + "";
}

const rankDisplay = document.getElementById('rank-display');
const rankAlbumButton = document.getElementById('rankAlbumButton');
const addAlbumButton = document.getElementById('addAlbumButton');
const listenListButton = document.getElementById('addListenListButton')
function rankButtons() {
    const albumAdded = !(userAlbums[album.id] == undefined);
    if (albumAdded && userAlbums[album.id].album_ranking > 0) {
        rankDisplay.innerHTML = "Rank:" + userAlbums[album.id].album_ranking;
        rankDisplay.style.display = 'flex' 
        rankAlbumButton.style.display = addAlbumButton.style.display = listenListButton.style.display = 'none';
    } else if (albumAdded) {
        rankAlbumButton.style.display = 'flex'
        listenListButton.style.display = addAlbumButton.style.display = rankDisplay.style.display = 'none';
    } else {
        rankDisplay.style.display = rankAlbumButton.style.display = 'none';
        if (album.id in JSON.parse(user.listenList)) {
            listenListButton.style.display = 'none'
        } else {
            listenListButton.style.display = 'flex'
        }
        addAlbumButton.style.display = 'flex';  
    }
}

const titleContainer = document.getElementById("title-container");
const albumName = document.getElementById('albumName');
const artistName = document.getElementById('artistName');
function titleAndArtist(album) {

    /* album name */
    albumName.innerHTML = album.name;

    /* artist */
    var artists = "By ";
    album.artists.forEach(artistProfile => {
        artists += artistProfile.name + ", "
    })
    artistName.innerHTML = artists.slice(0, -2);

    /* Set album and artist font sizes and store them in a variable  */
    albumName.style.fontSize = '6.5vw';
    artistName.style.fontSize = '3.25vw';
    var currAlbumFontSize = parseFloat(window.getComputedStyle(albumName).fontSize);
    var currArtistFontSize = parseFloat(window.getComputedStyle(artistName).fontSize);

    /* reduce the font size of the title until no y overflow */
    while (titleContainer.scrollHeight > titleContainer.clientHeight) {
        currAlbumFontSize -= 1;
        currArtistFontSize -= 0.5;
        albumName.style.fontSize = `${currAlbumFontSize}px`;
        artistName.style.fontSize = `${currArtistFontSize}px`;
    }

    /* reduce the font size of the title until no x overflow */
    while (titleContainer.scrollWidth > titleContainer.clientWidth) {
        currAlbumFontSize -= 1;
        currArtistFontSize -= 0.5;
        albumName.style.fontSize = `${currAlbumFontSize}px`;
        artistName.style.fontSize = `${currArtistFontSize}px`;
    }
}

async function getNumberOfArtistAlbums() {
    const albumIds = [];
    album.artists.forEach(artist => {
        albumIds.push(artist.id);
    })
    const artistAlbums = await getArtistAlbums(albumIds);
    
    const albums = JSON.parse(user.albums);
    var numAlbums = 0;
    artistAlbums.forEach(id => {
        if (albums[id] != undefined) {
            ++numAlbums;
        }
    })

    return numAlbums
}

const tracksContainer = document.getElementById("tracks-container");
function displayTracks(tracklist) {

    /* append tracks to container */
    tracksContainer.innerHTML = "";
    for (let i = 0; i < tracklist.length; ++i) {
        const track = makeTrack(i + 1, tracklist[i].name, 'white');
        tracksContainer.appendChild(track);
    }

    /* reduce the font size of the tracks until no x overflow */
    tracksContainer.style.fontSize = '3vw';
    var currTrackFontSize = parseFloat(window.getComputedStyle(tracksContainer).fontSize);
    while (tracksContainer.scrollHeight > tracksContainer.clientHeight) {
        currTrackFontSize -= 0.1;
        tracksContainer.style.fontSize = `${currTrackFontSize}px`
    }
}

function updateOptionsMenu(userAlbum) {

    /* add options menu button remove album button if applicable */
    if (userAlbum != undefined) {
        document.getElementById('optionsButton').style.display = 'flex'; 
    } else {
        document.getElementById('optionsButton').style.display = 'none'; 
        return;
    }

    /* add album ranking if applicable */
    if (userAlbum.album_ranking > 0) {
        document.getElementById('rerankAlbumButton').style.display = 'flex';
    } else {
        document.getElementById('rerankAlbumButton').style.display = 'none';
    }

    /* add track ranking if applcable */
    if (userAlbum.track_ranking.length > 0) {
        document.getElementById('rerankTracksButton').style.display = 'flex';
    } else {
        document.getElementById('rerankTracksButton').style.display = 'none';
    }
}

const colors = [
    "#DAA520", // GoldenRod (darker gold)
    "#4169E1", // RoyalBlue (darker blue)
    "#B22222", // FireBrick (darker red)
    "#228B22", // ForestGreen (darker green)
    "#FF8C00", // DarkOrange (darker orange)
    "#6A5ACD", // SlateBlue (darker purple)
    "#20B2AA", // LightSeaGreen (darker cyan)
    "#C71585", // MediumVioletRed (darker magenta)
    "#A0522D", // Sienna (darker brown)
    "#DB7093", // PaleVioletRed (darker pink)
    "#DCDCDC", // Gainsboro (darker white)
    "#A9A9A9", // DarkGray
    "#4682B4", // SteelBlue (darker teal)
    "#000080", // Navy (already dark)
    "#808000", // Olive (already dark)
    "#800000", // Maroon (already dark)
    "#00CED1", // DarkTurquoise (darker aqua)
    "#FF00FF", // Fuchsia (slightly darker magenta)
    "#4B0082", // Indigo (already dark)
    "#FF7F50", // Coral (darker coral)
    "#DC143C", // Crimson (already dark)
    "#FF8C00", // DarkOrange (already dark)
    "#00BFFF", // DeepSkyBlue (already dark)
    "#2E8B57", // SeaGreen (darker forestgreen)
    "#8B4513", // SaddleBrown (already dark)
];
const rankedTracksContainer = document.getElementById("ranked-tracks-container");
function rankedTracks() {

    var userAlbum = userAlbums[album.id];
    var tracklist = album.tracks.items;

    /* set font size equal to tracks container */
    rankedTracksContainer.style.fontSize = window.getComputedStyle(tracksContainer).fontSize;
    rankedTracksContainer.innerHTML = "";

    /* add message if tracks are unranked or album is unadded */
    if (userAlbum === undefined || userAlbum.track_ranking.length == 0) {

        /* copy tracks from tracks container and add blur */
        rankedTracksContainer.innerHTML = tracksContainer.innerHTML
        rankedTracksContainer.style.filter = "blur(3px)";
        
        /* add appropriate message */
        if (userAlbum === undefined) {
            document.getElementById('rank-tracks-message-albumAdded').style.display = 'none';
            document.getElementById('rank-tracks-message-noAlbum').style.display = 'flex';
        } else {
            document.getElementById('rank-tracks-message-albumAdded').style.display = 'flex';
            document.getElementById('rank-tracks-message-noAlbum').style.display = 'none';
        }
    } else {
        for (let i = 0; i < userAlbum.track_ranking.length; ++i) {
            const currTier = userAlbum.track_ranking[i].split(",");
            for (let j = 0; j < currTier.length; ++j) {
                const track = makeTrack(currTier[j], tracklist[currTier[j]].name, colors[i]);
                rankedTracksContainer.appendChild(track);
            }
        }
    }
}

function makeTrack(trackNumber, trackName, fontColor) {

    /* create track container */
    const trackContainer = document.createElement('div');
    trackContainer.classList = 'track-container'
    trackContainer.style.color = fontColor;

    /* add track number */
    const trackNum = document.createElement('div');
    trackNum.innerHTML = trackNumber + ": ";
    trackNum.style.whiteSpace = 'nowrap'
    trackContainer.appendChild(trackNum);

    /* add track name */
    const track = document.createElement('div');
    track.classList = 'track'
    track.innerHTML = trackName;
    trackContainer.appendChild(track)
    
    return trackContainer;
}

const rec_container = document.getElementById("rec_container");
async function displayRecomendations(tracklist) {

    /* get list of songs/albums related to songs on the album */
    var numSeedTracks = Math.min(tracklist.length, 4);
    var seedTracks = "";
    for (let i = 0; i < numSeedTracks; ++i) {
        seedTracks += tracklist[i].id + ',';
    }
    const recs = await getRecommendations(seedTracks.slice(0, -1));

    /* CHECK FOR DUPES, AND MAY BE SHOWING SAME ALBUM) */
    var recAlbums = [];
    let i = 0;
    while (i < recs.length && recAlbums.length < 4) {
        if (recs[i].album.album_type == "ALBUM" && recs[i].album.name != album.name && !recAlbums.includes(recs[i])) {
            recAlbums.push(recs[i].album);
        }
        ++i;
    }

    rec_container.innerHTML = "";
    for (let i = 0; i < recAlbums.length; ++i) {
        const cover = document.createElement('img');
        cover.src = recAlbums[i].images[0].url;
        cover.classList = 'albumImage'
    
        cover.addEventListener('click', function() {
            pageStack.push(recAlbums[i].id);
            page();
        });

        rec_container.appendChild(cover);
    }
}

/* back arrow */
function back() {
    if (pageStack.length == 0) {
        history.back();
    } else {
        pageStack.pop();
        page();
    }
}

/* menu funcs */
const menu = document.getElementById('menu');
const menuScreens = document.querySelectorAll('.menu-screen');
function closeMenu() {
    menuScreens.forEach(screen => {
        screen.style.display = 'none';
    })
    menu.style.display = 'none'
}


/************************************************************************************************************/
/*                                            Add Album Funcs                                               */
/************************************************************************************************************/

async function addAlbum() {

    /* hide add album button and reveal rank button */
    document.getElementById('addListenListButton').style.display = 'none'  
    document.getElementById('addAlbumButton').style.display = 'none'  
    document.getElementById('rankAlbumButton').style.display = 'flex';

    /* reveal rank tracks button */
    document.getElementById('rank-tracks-message-noAlbum').style.display = 'none';
    document.getElementById('rank-tracks-message-albumAdded').style.display = 'flex';

    /* remove from listen list of button is present */
    await removeFromListenList();

    /* init album hash if first added album */
    if (user.numAlbums == 0) {
        user.albums = '{}';
    }

    /* create new entry */
    const newEntry = {
        date_added: new Date(),
        number_of_plays: 1,
        track_ranking: [],
        album_ranking: 0,
        cover_url: album.images[0].url,
    };

    /* add entry to table and add table back to the database */
    userAlbums[album.id] = newEntry;
    user.albums = JSON.stringify(userAlbums);
    user.numAlbums += 1;

    /* add album to unranked */
    var artists = "";
    album.artists.forEach(artistProfile => {
        artists += artistProfile.name + ", "
    })
    unranked[album.id] = {album: album.name, artist: artists.slice(0, -2)}
    window.localStorage.setItem('unranked', JSON.stringify(unranked));
    console.log(unranked);
    console.log(JSON.parse(window.localStorage.getItem('unranked')));

    /* encode parameters */
    const params = new URLSearchParams({
        album: user.albums,
        numAlbums: user.numAlbums,
        user: user.username
    });

    /* update databse */
    await fetch(endpoint + 'newalbum?' + params.toString());

    /* click rank button */
    updateOptionsMenu();
    rankAlbum();
}

async function addToListenList() {

    const button = document.getElementById('addListenListButton')
    button.removeEventListener('click', addToListenList);
    button.textContent= "Added!" ;

    const listenList = JSON.parse(user.listenList);
    listenList[album.id] = album.images[0].url;
    user.listenList = JSON.stringify(listenList);

    const params = new URLSearchParams({
        listenList: user.listenList,
        user: user.username,
    });

    await fetch(endpoint + 'newListenList?' + params.toString());
}

async function removeFromListenList() {
    const listenList = JSON.parse(user.listenList);

    if (album.id in listenList) {
        delete listenList[album.id]
        user.listenList = JSON.stringify(listenList);

        const params = new URLSearchParams({
            listenList: user.listenList,
            user: user.username
        });

        await fetch(endpoint + 'newListenList?' + params.toString());
    }
}


/************************************************************************************************************/
/*                                           Album Rank Funcs                                               */
/************************************************************************************************************/

const rankMenu = document.getElementById('rankAlbum-menu');
async function rankAlbum() {

    /* display ranking screen */
    menu.style.display = 'flex';
    rankMenu.style.display = 'flex';

    /* create tiers */
    const tiers = createTiers(userAlbums);

    /* check if first album */
    if (tiers.length < 2) {
        updateRank(1, false);
        return;
    }

    /* set floor ceiling and middle */
    currRankFloor = 1;
    currRankCeiling = tiers.length - 1; 
    middle = Math.floor((currRankCeiling + currRankFloor) / 2);

    /* display album cover to rank and first album to compare to it*/
    albumToRank.src = album.images[0].url;
    albumToCompare.src = tiers[middle][0][1].cover_url;

    var choice = await getAlbumChosen();
    while (choice != -1) {
        if (choice == 0) {
            updateRank(middle, false);
            return;
        } else if (choice == 1) {
            currRankCeiling = middle - 1;
            middle = Math.floor((currRankFloor + currRankCeiling + 1) / 2);
            if (currRankFloor > currRankCeiling) {
                updateRank(currRankCeiling + 1, true);
                return;
            }
        } else if (choice == 2) {
            currRankFloor = middle + 1;
            middle = Math.floor((currRankFloor + currRankCeiling) / 2);
            if (currRankFloor > currRankCeiling) {
                updateRank(currRankFloor, true);
                return;
            }
        } 
        albumToCompare.src = tiers[middle][0][1].cover_url;


        choice = await getAlbumChosen();
    }
    
    
}

const albumToRank = document.getElementById('albumToRank');
const albumToCompare = document.getElementById('albumToCompare');
const albumEqual = document.getElementById('album-equal');
const exit = document.getElementById('white-x') // FIX
function getAlbumChosen() {
    return new Promise(resolve => {
        const albumToRankClicked = () => {
            albumToRank.removeEventListener('click', albumToRankClicked);
            albumToCompare.removeEventListener('click', albumToCompareClicked);
            albumEqual.removeEventListener('click', equalClicked);
            exit.removeEventListener('click', exitClicked);
            resolve(1);
        };

        const albumToCompareClicked = () => {
            albumToRank.removeEventListener('click', albumToRankClicked);
            albumToCompare.removeEventListener('click', albumToCompareClicked);
            albumEqual.removeEventListener('click', equalClicked);
            exit.removeEventListener('click', exitClicked);
            resolve(2); 
        };

        const equalClicked = () => {
            albumToRank.removeEventListener('click', albumToRankClicked);
            albumToCompare.removeEventListener('click', albumToCompareClicked);
            albumEqual.removeEventListener('click', equalClicked);
            exit.removeEventListener('click', exitClicked);
            resolve(0)
        }

        const exitClicked = () => {
            albumToRank.removeEventListener('click', albumToRankClicked);
            albumToCompare.removeEventListener('click', albumToCompareClicked);
            albumEqual.removeEventListener('click', equalClicked);
            exit.removeEventListener('click', exitClicked);
            resolve(-1);
        }


        albumToRank.addEventListener('click', albumToRankClicked);
        albumToCompare.addEventListener('click', albumToCompareClicked);
        albumEqual.addEventListener('click', equalClicked);
        exit.addEventListener('click', exitClicked);
    });
}

function updateRank(newRank, tierIsNew) {

    /* adjust albums if new tier is created */
    if (tierIsNew) {
        for (let id in userAlbums) {
            if (userAlbums[id].album_ranking >= newRank) {
                ++userAlbums[id].album_ranking;
            }
        }
    }
    userAlbums[album.id].album_ranking = newRank;
    user.albums = JSON.stringify(userAlbums);

    /* update unranked list */
    delete unranked[album.id];
    window.localStorage.setItem('unranked', JSON.stringify(unranked));

    /* encode parameters */
    const params = new URLSearchParams({
        albums: user.albums,
        user: user.username
    });

    /* update databse */
    fetch(endpoint + 'setRanking?' + params.toString());

    /* change diplay */
    rankButtons();
    updateOptionsMenu();
    closeMenu();
}

function createTiers(albums) {

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


/************************************************************************************************************/
/*                                           Track Rank Funcs                                               */
/************************************************************************************************************/

/* display opening menu to rank */
const rankTrackMenu = document.getElementById('rankTracks-menu')
const trackOne = document.getElementById('trackOne');
const trackTwo = document.getElementById('trackTwo')
const trackEqual = document.getElementById('track-equal')
let rankedTrackLength;
async function rankTracks() {

    /* display ranking screen */
    menu.style.display = 'flex';
    rankTrackMenu.style.display = 'flex';

    /* set background image */
    const elements = document.querySelectorAll('.trackToRank');
    elements.forEach(element => {
        element.style.backgroundImage = `url(${album.images[0].url})`;
    });

    rankedTrackLength = album.total_tracks;
    var array1 = Array.from({ length: rankedTrackLength }, (_, i) => i.toString()).sort(() => Math.random() - 0.5);
    var array2 = new Array(album.total_tracks);
    for (let j = 1; j <= Math.ceil(Math.log2(album.total_tracks)); ++j) {
        var size = Math.pow(2, j);
        var info = [0,0]
        while (info[1] < array1.length) {
            info = await compare(info[1], size, array1, array2, info[0]);
            if (info[0] == -1) {
                closeMenu();
                return;
            }
        }
        array1 = array2;
        var emptyArray = new Array(rankedTrackLength);
        array2 = emptyArray;
    }

    /* update track rankings */
    userAlbums[album.id].track_ranking = array1;
    user.albums = JSON.stringify(userAlbums);

    /* update screen */
    document.getElementById('ranked-tracks-container').style.filter = "blur(0px)";
    document.getElementById("rank-tracks-message-albumAdded").style.display = 'none';
    rankedTracks();
    closeMenu();

    /* encode parameters */
    const params = new URLSearchParams({
        albums: user.albums,
        user: user.username
    });
    fetch(endpoint + 'setRanking?' + params.toString());
}

async function compare(start, size, array1, array2, offset) {

    var start1 = start;
    var end1 = calcEnd(start1, size, array1)
    var start2 = end1;
    var end2 = calcEnd(start2, size, array1);
   
    var currInd = start - offset;
    while (start1 < end1 && start2 < end2) {

        if (array1[start1] == '') {
            return;
        }

        trackOne.innerHTML = album.tracks.items[firstNum(array1[start1])].name;
        trackTwo.innerHTML = album.tracks.items[firstNum(array1[start2])].name;

        var trackChosen = await getDecision();

        if (trackChosen == 1) {
            array2[currInd] = array1[start1];
            ++start1;
        } else if (trackChosen == 2) {
            array2[currInd] = array1[start2];
            ++start2;
        } else if (trackChosen == 0) {
            array2[currInd] = array1[start1] + "," + array1[start2];
            array2.pop();
            --rankedTrackLength;
            ++start1, ++start2;
            ++offset;
        } else {
            return [-1, -1];
        }

        ++currInd;
    }
    
    while (start1 < end1) {
        array2[currInd] = array1[start1];
        start1++;
        currInd++;
    }
    while (start2 < end2) {
        array2[currInd] = array1[start2];
        start2++;
        currInd++;
    }

    return [offset, end2];
}

function getDecision() {
    return new Promise(resolve => {
        const handleTrackOneClick = () => {
            trackOne.removeEventListener('click', handleTrackOneClick);
            trackTwo.removeEventListener('click', handleTrackTwoClick);
            trackEqual.removeEventListener('click', handleEqualClick);
            exit.removeEventListener('click', exitClicked);
            resolve(1); // Track One was chosen
        };

        const handleTrackTwoClick = () => {
            trackOne.removeEventListener('click', handleTrackOneClick);
            trackTwo.removeEventListener('click', handleTrackTwoClick);
            trackEqual.removeEventListener('click', handleEqualClick);
            exit.removeEventListener('click', exitClicked);
            resolve(2); // Track Two was chosen
        };

        const handleEqualClick = () => {
            trackOne.removeEventListener('click', handleTrackOneClick);
            trackTwo.removeEventListener('click', handleTrackTwoClick);
            trackEqual.removeEventListener('click', handleEqualClick);
            exit.removeEventListener('click', exitClicked);
            resolve(0)
        }

        const exitClicked = () => {
            trackOne.removeEventListener('click', handleTrackOneClick);
            trackTwo.removeEventListener('click', handleTrackTwoClick);
            trackEqual.removeEventListener('click', handleEqualClick);
            exit.removeEventListener('click', exitClicked);
            resolve(-1);
        }


        trackOne.addEventListener('click', handleTrackOneClick);
        trackTwo.addEventListener('click', handleTrackTwoClick);
        trackEqual.addEventListener('click', handleEqualClick);
        exit.addEventListener('click', handleEqualClick)

    });
}

function firstNum(tier) {
    const index = tier.indexOf(',');
    if (index == -1) {
        return tier;
    } else {
        return tier.substring(0, index);
    }
}

/* minimum length of array1 !!! */
function calcEnd(start, size, array1) {
    var ind = 0;
    var end = start;
    while (ind < size / 2 && end < array1.length) {
        ind += Math.max(array1[end].split(",").length, 1)
        ++end;
    }
    return end;
}

/************************************************************************************************************/
/*                                         Options Menu Funcs                                               */
/************************************************************************************************************/

const optionsMenu = document.getElementById('optionsMenu');
function options(event) {
    if (optionsMenu.style.display != 'flex') {
        optionsMenu.style.display = 'flex';
        event.stopPropagation();
        document.addEventListener('click', handleOptionsClick);
    }
}

function handleOptionsClick(event) {
    if (!optionsMenu.contains(event.target)) {
        optionsMenu.style.display = 'none';
        document.removeEventListener('click', handleOptionsClick);
    }
}

async function removeAlbum() {

    /* update albums */
    delete userAlbums[album.id];
    user.albums = JSON.stringify(userAlbums);
    --user.numAlbums;

    /* encode parameters */
    const params = new URLSearchParams({
        album: user.albums,
        numAlbums: user.numAlbums,
        user: user.username
    });

    /* update databse */
    await fetch(endpoint + 'newalbum?' + params.toString());

    /* update unranked if necessary */
    if (unranked[album.id] != undefined) {
        delete unranked[album.id];
        window.localStorage.setItem('unranked', JSON.stringify(unranked));
    }

    /* update screen */
    rankButtons();
    rankedTracks();
    updateOptionsMenu();
    document.getElementById("optionsMenu").style.display = 'none';
}

async function rerankAlbum() {

    /* set rank to 0 */
    var ranking = userAlbums[album.id].album_ranking;
    userAlbums[album.id].album_ranking = 0;
    user.albums = JSON.stringify(userAlbums);

    /* update other albums if necessary */
    const tiers = createTiers(userAlbums);
    console.log(tiers);
    if (tiers.length != ranking && tiers[ranking].length == 0) {
        for (let id in userAlbums) {
            if (userAlbums[id].album_ranking > ranking) {
                --userAlbums[id].album_ranking;
            }
        }
    }

    /* add album to unranked */
    var artists = "";
    album.artists.forEach(artistProfile => {
        artists += artistProfile.name + ", "
    })
    unranked[album.id] = {album: album.name, artist: artists.slice(0, -2)}
    window.localStorage.setItem('unranked', JSON.stringify(unranked));

    /* encode parameters */
    const params = new URLSearchParams({
        album: user.albums,
        numAlbums: user.numAlbums,
        user: user.username
    });

    /* update databse */
    await fetch(endpoint + 'newalbum?' + params.toString());

    /* update display */
    updateOptionsMenu();
    rankButtons();
    rankAlbum();
}


/************************************************************************************************************/
/*                                            Spotify Funcs                                                 */
/************************************************************************************************************/

/* method to get the original token */
async function getToken() {
    const clientID = '1036f292de2741b884a6b6e3769957a3';
    const clientSecret = 'ffab91a93139428cbde25ab5206464c7';
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

async function getRecommendations(seedTracks) {
    const token = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${seedTracks}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data.tracks;
}

async function getAlbum(id) {
    const token = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();
    return data
}

async function getArtistAlbums(artistIds) {
    /* get albums from the searched artist */
    const token = await getToken();
    const promises = artistIds.map(async (id) => {
        const response = await fetch(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album&limit=50`, {
            headers: {
              'Authorization': 'Bearer ' + token
            }
        });
        const data = await response.json();
        return data.items;
    });
    const results = await Promise.all(promises);

    /* make into single array */
    const albumArray = [];
    results.forEach(artist => {
        artist.forEach(artistAlbum => {
            albumArray.push(artistAlbum.id);
        })
    })

    return albumArray;
}
