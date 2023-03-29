import {getAllTransaction, getOneTransaction, insertTransaction} from '../repository/transaction.repo'
import {Request, Response} from 'express'
const fs = require('fs')

// get all transaction from database
async function getAll(req:Request, res:Response) {

        const data = await getAllTransaction(req.query)

        res.json({
            data,
        })

        return 

}

// get one specific from database   
async function getOne(req:Request, res:Response) {
    try {
        const data = await getOneTransaction(parseInt(req.params.id), req.query)
        res.json({
            data,
            status:200
        })


    } catch (error) {
        res.json({
            error,
            status:500
        })

        return 
    }
  
}

// i create this special endpoint to migrate data from our file the file located in the
// under the files folder why? because we can enhance this to further endpoint that handle
// another csv file from client in the future

async function insertDatabaseTransaction(req:Request, res:Response) {
    try {
    const data = await insertTransaction()
    res.json({
        data:'success',
        status:200
    })

    return
    } catch (error) {
        const data = await insertTransaction()
        res.json({
            data: error,
            status:200
        })
    
        return

    }
}

export {
    getAll,
    getOne,
    insertDatabaseTransaction
}