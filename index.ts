import express from 'express'
import {getAll,getOne, insertDatabaseTransaction} from './controller/transaction.controller'
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";


const app = express()

require('dotenv').config()
const port = process.env.PORT || 3000



app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  

// i dont seperate the routes due to not really necesarry
// but we can separate this to different folder and make it look cleaner
app.get('/transaction/',getAll )
app.get('/transaction/:id',getOne )
app.post('/transaction/',insertDatabaseTransaction)


app.listen(port,()=>{
console.log(`listening live and well at port ${port}`)
})