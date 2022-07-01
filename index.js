const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
        const userCollection = client.db("powerHack").collection("user");

        app.get('/billing-list', async (req, res) => {
            const query = {}
            const page = parseInt(req.query.page)
            const searched = req.query.searched
            const size = 10;
            const result = await billCollection.find(query).sort({ _id: -1 }).skip(page * 10).limit(size).toArray()
            res.send({ result })
        })
        app.get('/billingCount', async (req, res) => {
            const count = await billCollection.estimatedDocumentCount()
            res.send({ count })
        })



        app.post('/add-billing', async (req, res) => {
            const billing = req.body;
            const result = await billCollection.insertOne(billing)
            res.send(result)
        })
        app.put('/update-billing/:id', async (req, res) => {
            const id = req.params.id;
            const newBill = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: newBill
            };
            const result = await billCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.delete('/delete-billing/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await billCollection.deleteOne(query);
            res.send(result);
        });

        app.post('/registration', async (req, res) => {
            const data = req.body;
            const email = data.email
            const userPass = data.password;
            const password = await bcrypt.hash(userPass, 10)
            const user = await userCollection.find({}).toArray();
            let isUser;
            user.forEach(us => {
                if (us.email === email) {

                    return isUser = true
                } else {
                    return isUser = false
                }
            })

            if (isUser) {

                console.log(isUser)
                res.send({ message: 'User already Register' })
            } else {
                const newUser = { email, password }
                const result = await userCollection.insertOne(newUser)
                res.send(result)
            }
        })
        app.post('/login', async (req, res) => {
            const email = req.body.email
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
