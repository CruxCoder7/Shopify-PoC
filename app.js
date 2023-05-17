import express from "express"
import requestPromise from "request-promise"
import dotenv from "dotenv"
dotenv.config()

const app = express()

app.post("/webhook", (req, res) => {
    console.log("admin-created webhook event received!", req.body);
    res.status(200).send('EVENT_RECEIVED');
})

app.get("/data", (req, res) => {
    // req.query.resource = products | webhooks
    let url = `https://tif-storee.myshopify.com/admin/api/2023-04/${req.query.resource}.json`;
    let options = {
        method: "GET",
        uri: url,
        json: true,
        headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            "content-type": "application/json"
        }
    }
    requestPromise(options)
        .then(function (parsedBody) {
            res.json(parsedBody);
        })
        .catch(function (err) {
            res.json(err);
            res.status(404).send("bad")
        })
})

app.post("/custupdwebhk", (req, res) => {
    console.log("api-created webhook event received (customers/update)!");
    res.status(200).send('EVENT_RECEIVED');
})

app.post("/prodcrtwebhk", (req, res) => {
    console.log("api-created webhook event received (products/create)!");
    res.status(200).send('EVENT_RECEIVED');
})

app.get("/createwebhk", async (req, res) => {
    const resp = await fetch('https://tif-storee.myshopify.com/admin/api/2023-04/webhooks.json', {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'webhook': {
                'address': 'https://d667-2406-7400-c6-ff6c-1468-4ed2-bc15-af29.ngrok-free.app/prodcrtwebhk',
                'topic': 'products/create',
                'format': 'json'
            }
        })
    });

    const val = await resp.json()
    res.json(val);
})


app.get("/", (req, res) => {
    res.send("hiii");
})

app.listen(3000, () => {
    console.log("3000!!");
})