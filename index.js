const express = require('express')
const cors = require('cors')
require('dotenv').config()
var ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');//fileupload
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('service'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zqmy8.mongodb.net/homeRelocation?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const port = process.env.PORT || 5000;



client.connect(err => {
  const serviceCollection = client.db("homeRelocation").collection("service");
  const orderCollection = client.db("homeRelocation").collection("order");
  const reviewCollection = client.db("homeRelocation").collection("review");
  const adminCollection = client.db("homeRelocation").collection("admin");
  //add service
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const area = req.body.area;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };
    console.log(name,price,description,area,file);
    serviceCollection.insertOne({ name, price,description,area, image })
    .then(result => {
        res.send(result.insertedCount > 0);
        })
  })
  //red all services
  app.get('/services', (req, res) => {
    serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    });
    //load single product
  app.get('/services/:id',(req, res) =>{
    serviceCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err, result) =>{
      res.send(result[0]);
    })
  })
  //delete Product
  app.delete('/services/:id',(req, res)=>{
    serviceCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result =>{
      res.send(result.deletedCount>0);
      console.log('deleted success')
    })
  })
  //create service order
  app.post('/addOrder',(req, res)=>{
    const order = req.body;
    console.log(order)
    orderCollection.insertOne(order)
    .then( result =>{
        res.send(result.insertedCount > 0);
        console.log(result)
    })
   })
   //get all orders
   app.get('/orders',(req, res)=>{
    orderCollection.find({})
    .toArray((err, documents) =>{
        res.send(documents);
    })
   });
   //create service order
  app.post('/addReview',(req, res)=>{
    const review = req.body;
    reviewCollection.insertOne(review)
    .then( result =>{
        res.send(result.insertedCount > 0);
        console.log(result)
    })
   });
   //get all orders
   app.get('/reviews',(req, res)=>{
    reviewCollection.find({})
    .toArray((err, documents) =>{
        res.send(documents);
    })
   });
   //create admin
   app.post('/addAdmin',(req, res) =>{
       const admin = req.body;
    adminCollection.insertOne(admin)
    .then( result =>{
        res.send(result.insertedCount > 0);
        console.log(result)
    })
   });
   //side bar private
   app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
        .toArray((err, admin) => {
            res.send(admin.length > 0);
        })
    })
   //find order by email
   app.get('/orderByEmail',(req, res) =>{
    orderCollection.find({email: req.query.email})
        .toArray((err, documents) =>{
        res.send(documents);
        })
   })
  console.log('db connected');
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})