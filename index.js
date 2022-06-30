const express = require('express')
const app = express()
const port = process.env.PORT || 5000


const cors = require('cors');
require('dotenv').config()
// middle wares ------------------- 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_PASSWORD}@cluster0.f4xqs.mongodb.net/?retryWrites=true&w=majority`;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const billCollection = client.db("powerHack").collection("bills");

        app.get('/billing-list', async (req, res) => {
            const query = {}
            const result = await billCollection.find(query).toArray()
            res.send(result)
        })
    } finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to Power Hacks')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
