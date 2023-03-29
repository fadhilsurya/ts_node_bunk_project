import {Prisma, PrismaClient, Transaction} from '@prisma/client'
import * as fs from "fs";
import * as path from "path";
import { parse } from 'csv-parse';
import { use } from 'chai';
import { stringify } from 'querystring';


const prisma = new PrismaClient()

 async function getAllTransaction(col:any) {
    try {
        // we define the basic query which the condition we will add later on based on the condition
        let query:string= `SELECT * FROM "public"."Transaction" AS t \n`

        // we use counter as our tools to navigate to the conditional placement bellow
        let counter:number = 0
        let flagging = true

        if (Object.keys(col).length == 1 && col['sort']){
            flagging = false
        }

        // this is the place we build our conditional
        if(flagging){
            let where:String= 'WHERE '

            for (const key in col) {
                if (key != 'sort'){
                    if (counter == 1){
                        where += `${key} LIKE '${col[key]}'`

                    } else {
                        where += ` AND ${key} LIKE '${col[key]}'`
                    }
                }
                counter += 1
            }

            query += where
        }
            // we join our conditional to the main query
    
        if (col.sort){
            query += `\n ORDER BY ${col.sort}`
        }
        // we proceed to do query to get the desire response data
        const result = await prisma.$queryRawUnsafe<Transaction[]>(query)

        return result

    } catch (error) {

        return error
        
    }}

    // get one transaction
async function getOneTransaction(id:Number, col:any) {
    // here we try to form the query that we will use to access database
    try {
        let query:string= `
        SELECT * FROM "public"."Transaction" 
        WHERE t.id = ?
        LIMIT 1
        `

        if(col.fields){
            query =  `
            SELECT ${col.fields} FROM "public"."Transaction" 
            WHERE id = ${id}
            LIMIT 1
            `
        }
        // we query the database
        const result = await prisma.$queryRawUnsafe<Transaction>(query)

        return result

    } catch (error) {
        return error
    }
}

// we will insert from csv to database 
async function insertTransaction() {
    // first we create type to be used in when we parse the csv into array of  Transaction type
    type TransactionType = {
        account:      string
        amount:       Number
        counterparty: String
        tags :        String
        date  :       Date
        location :    String
      
    }
    // validation if the data already exist wouldn't be able to insert another one
    // to maintain our database integrity
    const result = await prisma.transaction.findFirst()
    if (result){
        return new Error('data transaction already migrated')
    }

    // headers in the csv file
    const headers = ['id', 'account', 'amount', 'counterparty', 'tags','date', 'location'];

    // we need to get the path to the file location
    const csvFilePath = path.resolve(__dirname, '../files/sample_transactions.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    // parsing the csv file to manipulate
    parse(fileContent, {
        delimiter: ',',
        columns: headers
    },async (error, result:TransactionType[])=>{
        if(error){
            throw error
        }
    let dataMap = []

// we loop the data to be able to shape the data to our desire to be bulk insert later on
// using prisma createMany
        for (let index = 1; index < result.length; index++) {
            let element = result[index]
            let dataAmount = Number(element.amount) 
    
            let flagging:boolean = true
            
            let dataObj = {
                account:String(element.account)   ,  
                amount: Number(dataAmount)      ,
                counterparty: String(element.counterparty)  ,
                tags :  String(element.tags)      ,
                date  :       new Date(result[index].date) ,
                location :  String(element.location)
            }

            // i add this validation in case in our many data there's few corrupt data
            // we will not include the corrupt data to our database
            if(!dataObj.account||!dataObj.amount||!dataObj.counterparty
                ||!dataObj.date||!dataObj.location||!dataObj.tags){
                flagging = false
            }

            // we push the data that we believe already clean to an array
            if(flagging) {
                dataMap.push(dataObj)
            }
        }
try {
    // we bulk insert the already clean data to the database
    const users = await prisma.transaction.createMany({
        data: dataMap,
      })
      return users
} catch (error) {
    console.log(error)
        return error
}
    })
}


export {
    getAllTransaction,
    getOneTransaction,
    insertTransaction
}