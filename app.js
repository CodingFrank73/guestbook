const express = require("express");
const fs = require("fs");
const { stat } = require("fs");
const bodyParser = require("body-parser");
const { body, validationResult } = require('express-validator')

const port = 9000;
const app = express();

let messages = [];

app.set("view engine", "ejs");
app.listen(port, () => console.log("server listen on port: ", port));

app.use(express.static('public'));
app.use(bodyParser.urlencoded());

fs.readFile("./message.json", 'utf8', (err, data) => {
    if (err) {
        console.log("Error in readFile error.json");
        return
    }
    else {
        messages = JSON.parse(data);
    }
})

app.use((req, res, next) => {
    console.log("new request", req.method, req.url);
    next();
})

app.use("/guestbook", (req, res) => {
    res.render("pages/guestbook", {
        messages,
        title: "Guestbook"
    })
})

app.post("/newMessage",

    body("firstName").isLength({ min: 1, max: 50 }),
    body("lastName").isLength({ min: 1, max: 50 }),
    body("email").isEmail(),
    body("message").isLength({ min: 1, max: 1000 }),

    (req, res) => {
        const newMessage = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const validationErrors = errors.array();
            res.status(400).render("pages/invalidInputError", {
                description: "Ungültige Eingabe, bitte nochmals versuchen...", validationErrors,
                title: "400 - Error"
            })
            return
        }

        messages.push(newMessage)

        addData(messages);

        res.redirect("/guestbook")

    })

function addData(messages) {
    let data = JSON.stringify(messages);

    fs.writeFile("./message.json", data, (err) => {
        if (err) {
            console.log("Daten konnten nicht in message.json geschrieben werden");
            return
        }
        console.log("Daten gespeichert");
    })
}

