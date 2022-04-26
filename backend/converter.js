const fs = require("fs");

const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const schedule = require('node-schedule');
const fetch = require('node-fetch');

const app = express();
const bgRouter = express.Router();
const port = process.env.PORT || 3000;

let title;

let today = new Date();
let date;

// Middle ware
app.use(bodyparser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(bodyparser.json({
    limit: '50mb'
}));
app.use(cors());

bgRouter.route('/addEdubox')
    .post(async (req, res) => {
        title = req.body.title

        let link = {
            title: title,
            link: `<li><a href='./EDUbox.html?title=${title}' target='_blank'>${title}</a></li>`
        };
        let data = {
            title: title,
            data: req.body.selectedData
        };

        const collectionLinks = db.collection("links");
        collectionLinks.insertOne(link).then(result => {
            console.log(result);
        });

        const collectionData = db.collection("eduboxData");
        collectionData.insertOne(data).then(result => {
            console.log(result);
        });
        res.send("Data file and link have been created!");

        // await generateJSONFile(req.body.selectedData);
        // await generateNewLink(title);
    });

bgRouter.route('/getData')
    .get((req, res) => {
        let data = fs.readFileSync('./data.json');
        let json = JSON.parse(data);
        res.send(json);

        // const collection = db.collection("allData");
        // collection.find({}).toArray((error, result) => {
        //     if (error) {
        //         return res.status(500).send(error);
        //     }
        //     res.json(result);
        // });
    });

bgRouter.route('/getEdubox/:title')
    .get((req, res) => {
        let title = req.params.title;

        // let data = fs.readFileSync('./data/' + title + '.json');
        // let json = JSON.parse(data);
        // res.send(json);

        async function findBox() {
            try {
                const collection = db.collection("eduboxData");

                const result = await collection.findOne({
                    title: title
                });
                res.json(result);
            } catch (err) {
                return err;
            }
        }
        findBox();
    });

bgRouter.route('/getLinks')
    .get((req, res) => {
        // let data = fs.readFileSync('./links.json');
        // let json = JSON.parse(data);
        // res.send(json);

        const collection = db.collection("links");
        collection.find({}).toArray((error, result) => {
            if (error) {
                return res.status(500).send(error);
            }
            res.json(result);
        });
    });

bgRouter.route('/deleteEdubox')
    .delete(async (req, res) => {
        title = req.body.title

        const collectionLinks = db.collection("links");
        const collectionData = db.collection("eduboxData");

        // await deleteEduboxFiles(title);
        // res.send("deleted!");

        async function findBox() {
            try {
                const result1 = await collectionLinks.deleteOne({
                    title: title
                });

                const result2 = await collectionData.deleteOne({
                    title: title
                });
                res.json(result1);
                res.json(result2);
                res.send('deleted');
            } catch (err) {
                return err;
            }
        }
        findBox();
    });

async function generateJSONFile(passedData) {
    try {
        // await fs.writeFile(`./data/${title}.json`, JSON.stringify(passedData), function (err) {
        //     if (err) throw err;
        //     console.log('Data file is created successfully.');
        // });
    } catch (err) {
        console.error(err)
    }
}

async function deleteEduboxFiles(edubox) {
    await fs.unlink(`./data/${edubox}.json`, function (err) {
        if (err) throw err;
        console.log('Data file deleted!');
    });

    let data = fs.readFileSync('./links.json');
    let json = JSON.parse(data);
    json = json.filter((comp) => {
        return comp.title !== edubox
    });

    await fs.writeFile('./links.json', JSON.stringify(json, null, 2), function (err) {
        if (err) throw err;
        console.log('Links file is updated successfully.');
    });
}

async function generateNewLink(title) {
    let duplicate = false;
    let data = fs.readFileSync('./links.json');
    let json = JSON.parse(data);

    json.forEach(link => {
        if (link.title == title) {
            duplicate = true;
        }
    });

    if (!duplicate) {
        let newLinkObject = {
            "title": title,
            "link": `<li><a href='./EDUbox.html?title=${title}' target='_blank'>${title}</a></li>`
        }
        json.push(newLinkObject);
        link = json;

        // await fs.writeFile('./links.json', JSON.stringify(json), function (err) {
        //     if (err) throw err;
        //     console.log('Links file is updated successfully.');
        // });
    }
}

var j = schedule.scheduleJob('0 0 * * *', function () {
    console.log('Updating local data storage...');
    const url = "https://onderwijs.api.vlaanderen.be/onderwijsdoelen/onderwijsdoel?versie=2.0";
    fetch(url, {
            method: "GET",
            withCredentials: true,
            headers: {
                'X-API-KEY': 'yrkJV8z5jYAje8W7ErNnenp9j3Yz8xH8',
                'Accept': '*/*',
                'Content-Type': 'application/json'
            }
        })
        .then(resp => resp.json())
        .then(function (jsondata) {
            const newData = jsondata.gegevens.member;
            // fs.writeFileSync('./data.json', JSON.stringify(newData));

            fs.writeFile(`./data.json`, JSON.stringify(newData), function (err) {
                if (err) throw err;
                date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + '::' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
                console.log('Completed update at ' + date);
            });
        })
        .catch(function (error) {
            console.log(error);
        });
});

app.get('/', (req, res) => {
    res.send("server is up and running... V6.1.1 --- Last data update was at: " + date)
});

app.use('/api', bgRouter);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

const {
    MongoClient,
    ServerApiVersion,
    ObjectID
} = require('mongodb');
const uri = "mongodb+srv://EduboxAdmin:hPxvQ8Mz^eHpD7v*@sleutelcompetentieclust.m64ax.mongodb.net/competentie-platform?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

let dbName = "competentie-platform";
let db;

client.connect(err => {
    if (err) {
        throw err;
    }

    db = client.db(dbName);
    console.log("Connected correctly to server");
});