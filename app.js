// import packages
const express = require('express');
const cors = require('cors')
const config = require('dotenv');
const bodyParser = require('body-parser');
const { connectDB } = require('./utils/database');
// const errorHandler = require('./middlewares/errorHandler');

// impport routes
// const auth = require('./routes/auth.routes')
// const admin = require('./routes/admin.routes')
// const product =require('./routes/product.routes')
// const orders =require('./routes/orders.routes')
// const users =require('./routes/customers.routes')


config.config({ path: "./config/config.env" })

// create express object
const app = express()


app.use(cors())   //should be the first middleware


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
// app.use('/api/auth', auth)
// app.use('/api/admin', admin)
// app.use('/api/product', product)
// app.use('/api/orders', orders)
// app.use('/api/user', users)


// app.use(errorHandler)   //should be the last middleware


const port = process.env.PORT || 5021;


// connect to database

connectDB().then(() => {
     console.log("Databse connection successful")

     // start express server
     app.listen(port, () => {
          console.log(`server running on port ${port}`)
     })
}).catch(err => {
     console.log(err)
})