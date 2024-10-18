/*
*  Server set up and close
*/


/* Create a connection to the database */
// const connection = mysql.createConnection({
//     host: 'albumrater-db.cdu4gyqu6bfx.us-east-2.rds.amazonaws.com',
//     user: 'admin',
//     password: 'zrOcuTJQfMDvdEOnnsus',
//     database: 'albumrater-db'
// });

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 3306;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

/* Create a connection to the database */
const connection = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});

/* Connect to the database */
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }

    console.log('Connected to database');
});

// Start the server
// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});

// Close the connection when the server is closed
process.on('SIGINT', () => {
    connection.end((err) => {
        if (err) {
            console.error('Error closing connection: ' + err.stack);
        }
        console.log('Connection closed');
        process.exit();
    });
});

/****************************************************************************** */

/*
 * API endpoints (allows access to sql database)
 */

const NAME = 'albumRater'

/* allows client to access profile in database with a matching username */
app.get('/getuser', (req, res) => {
    const user = req.query.user
    connection.query('SELECT * FROM albumRater.rater WHERE username = ?', [user], (error, results) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        res.json(results);
    });
});

/* creates new entry in database with new user */
app.get('/newuser', (req, res) => {

    /* create new user */
    const user = req.query.user
    const pass = req.query.pass
    const dateCreated = new Date();
    const json = JSON.stringify({});
    connection.query('INSERT INTO albumRater.rater VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [user, pass, 0, json, json, json, null, null, 0, dateCreated, json, json], (error) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        console.log('added')
    });

    /* return new user */
    connection.query('SELECT * FROM albumRater.rater WHERE username = ?', [user], (error, results) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        res.json(results);
    });
});

/* fetches profile picture of given user */
app.get('/getPic', (req, res) => {
    const user = req.query.user
    connection.query('SELECT pic FROM albumRater.rater WHERE username = ?', [user], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send('Error retrieving profile picture: ' + error.stack);
        }

        if (results.length > 0) {
            const binaryData = results[0].pic;
            const base64Data = `data:image/png;base64,${binaryData.toString('base64')}`;
            res.send({ image: base64Data });
            console.log("profile pic sent");
        } else {
            res.status(404).send('Profile picture not found.');
        }
    });
});

/* creates a new instance of an album to a user */
app.get('/newalbum', (req, res) => {
    const album = req.query.album
    const user = req.query.user
    const numAlbums = req.query.numAlbums
    connection.query('UPDATE albumRater.rater SET albums = ?, numAlbums = ? WHERE username = ?', [album, numAlbums, user], (error) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        console.log('added')
        return res.status(200).send('Update successful');
    });
});


/* creates a new instance of an album to a user */
app.get('/newListenList', (req, res) => {
    const listenList = req.query.listenList
    const user = req.query.user
    connection.query('UPDATE albumRater.rater SET listenList = ? WHERE username = ?', [listenList, user], (error) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        console.log('added')
        res.send('Listen list updated successfully');
    });
});

app.get('/setBanner', (req, res) => {

    const user = req.query.user
    const banner = req.query.banner
    connection.query('UPDATE albumRater.rater SET banner = ? WHERE username = ?', [banner, user], (error) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        console.log('added')
    });
});

app.get('/setBannerPos', (req, res) => {

    const user = req.query.user
    const bannerPos = req.query.bannerPos
    connection.query('UPDATE albumRater.rater SET bannerPos = ? WHERE username = ?', [bannerPos, user], (error) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        console.log('bannerPos set')
        res.send('bannerPos updated successfully');
    });
});

app.get('/setRanking', (req, res) => {

    const user = req.query.user
    const albums = req.query.albums
    connection.query('UPDATE albumRater.rater SET albums = ? WHERE username = ?', [albums, user], (error) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        console.log('added')
    });
});

app.post('/setProfilePic', (req, res) => {
    const { image } = req.body;
    const username = req.query.user
    
    /* Extract Base64 data (if it's a Data URL, strip the prefix) */
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Buffer.from(base64Data, 'base64');

    /* store profile pic */
    connection.query('UPDATE albumRater.rater SET pic = ? WHERE username = ?', [binaryData, username], (error) => {
        if (error) {
            return res.status(500).send('Error saving profile picture: ' + error.stack);
        }
        console.log("profile pic updated");
        return res.send({ success: true });
    });
})

/* creates a new instance of an album to a user */
app.get('/newUsername', (req, res) => {
    const olduser = req.query.olduser
    const newuser = req.query.newuser
    console.log(olduser + " " + newuser)
    connection.query('UPDATE albumRater.rater SET username = ? WHERE username = ?', [newuser, olduser], (error) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        console.log('updated username');
        return res.status(200).send('Update successful');
    });
});

app.get('/newPassword', (req, res) => {
    const user = req.query.user
    const newPass = req.query.newPass
    console.log(newPass + " " + user);
    connection.query('UPDATE albumRater.rater SET password = ? WHERE username = ?', [newPass, user], (error) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        console.log('updated password');
        return res.status(200).send('Update successful');
    });
});

app.get('/deleteAccount', (req, res) => {
    const user = req.query.user
    connection.query('DELETE FROM albumRater.rater WHERE username = ?', [user], (error) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        console.log('account deleted');
        return res.status(200).send('Update successful');
    });
});

app.get('/getUsers', (req, res) => {
    connection.query('SELECT * FROM albumRater.rater', (error, results) => {
        if (error) {
            return res.status(500).send('Error executing query: ' + error.stack);
        }
        res.json(results);
    });
});
