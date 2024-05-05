const express = require('express');
const cors = require('cors');
require('./db/conn');
const User = require('./db/user');
const Product = require('./db/product');
const app = express();
const port = process.env.PORT || 5000;
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const jwtKey = 'OnePiece';


// Set up CORS
app.use(cors());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.options('*', cors());


//Register
app.post("/register", async (req, res) => {
    try {
        let user = new User(req.body);
        let result = await user.save();
        result = result.toObject();
        delete result.password;
        jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
            if (err) {
                res.send({ result: 'Something went wrong' });
            }
            res.send({ result, token: token });
        })
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle any errors and send an appropriate response
    }
});

//Login
app.post('/login', async (req, res) => {
    if (req.body.email && req.body.password) {
        let user = await User.findOne(req.body).select("-password");
        if (user) {
            jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    res.send({ result: 'Something went wrong' });
                }
                res.send({ user, token: token });
            })
        } else {
            res.send({ result: 'no user found' });
        }
    }
    else {
        res.send({ result: 'Please fill all fields' });
    }
});

//Add a product
app.post('/addProduct', tokenAuthorization, async (req, res) => {
    try {
        let product = new Product(req.body);
        let result = await product.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle any errors and send an appropriate response
    }
})


//Delete a product using id
app.delete("/product/:id", tokenAuthorization, async (req, res) => {
    const result = await Product.deleteOne({ _id: req.params.id });
    res.send(result);
})

//Get all products
app.get('/products', tokenAuthorization, async (req, res) => {
    let products = await Product.find();
    if (products.length > 0) {
        res.send(products);
    }
    else {
        res.send({ result: "error in list product" });
    }
})

//Get product using id
app.get('/product/:id', tokenAuthorization, async (req, res) => {
    let result = await Product.findOne({ _id: req.params.id });
    if (result) {
        res.send(result);
    } else {
        res.send({ "result": "error in  getting a product" })
    }
})

//Update a product
app.put('/product/:id', tokenAuthorization, async (req, res) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    if (result) {
        res.send(result);
    } else {
        res.send({ "result": "error in  product update" })
    }
})

app.get('/search/:key', tokenAuthorization, async (req, res) => {
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { category: { $regex: req.params.key } }
        ]
    });
    res.send(result);
})

//Token Authorization
function tokenAuthorization(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                res.status(401).send({ result: "Please Provide valid token" })
            } else {
                next();
            }
        })
    } else {
        res.status(403).send("Please add token with header")
    }
}


// Start the server
app.listen(port, () => {
    console.log("Listening on port " + port);
});