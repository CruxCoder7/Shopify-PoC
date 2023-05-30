import express from "express"
import requestPromise from "request-promise"
import dotenv from "dotenv"
import crypto from "crypto"
dotenv.config()

const app = express()

/**
 *  API endpoint to create a webhook
 *  Shopify will send the webhook event containing the payload to the `address` that we specify
 *  The `topic` is the action, by doing which, the webhook will be triggered. (Eg: products/update, customer/update, products/delete)
 *  The Access Token is the Shopify Store's access token
 */
app.get("/create_webhook", async (req, res) => {
    const resp = await fetch('https://tif-dyrect.myshopify.com/admin/api/2023-04/webhooks.json', {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'webhook': {
                'address': 'https://d7fe-103-218-237-96.ngrok-free.app/api/v1/shopify/product_update?client=testdev',
                'topic': 'products/update',
                'format': 'json'
            }
        })
    });

    const val = await resp.json()
    res.json(val);
})

/**
 * This is the endpoint of the `address` that we specified in the creation of the webhook. In this case, /create_product.
 * In this case, whenever a product is created - The `topic` that we specified in the creation of the webhook, 
 * Shopify will send a hmacHeader. We have to generate a hash with this header and compare it with our Store's Secret Key.
 * The Payload sent by Shopify is in Buffer format. We have to convert it into JSON.
 * In this case, the payload will contain all the details about the product that we just created.
 */
app.post('/create_product', express.raw({ type: 'application/json' }), (req, res) => {
    const hmacHeader = req.get('X-Shopify-Hmac-SHA256');
    const payload = req.body;

    // Verify the webhook request
    const calculatedHash = crypto
        .createHmac('sha256', process.env.SHOPIFY_SECRET_KEY)
        .update(payload)
        .digest('base64');

    if (calculatedHash === hmacHeader) {
        const bufferData = Buffer.from(payload, "hex");
        const data = bufferData.toString();
        const final_payload = JSON.parse(data)
        console.log(final_payload);

    } else {
        // Invalid webhook request
        console.error('Invalid webhook request');
    }

    console.log("api-created webhook event received (products/create)!");

    res.status(200).send('EVENT_RECEIVED');

});


/**
 * Endpoint to retrieve all products or all webhooks associated with our store.
 */
app.get("/data", (req, res) => {
    // req.query.resource = products | webhooks
    let url = `https://2c746c.myshopify.com/admin/api/2023-04/${req.query.resource}.json`;
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

app.get("/", (req, res) => {
    res.send("Shopify Webhooks");
})

app.listen(3000, () => {
    console.log("Listening on PORT 3000");
})