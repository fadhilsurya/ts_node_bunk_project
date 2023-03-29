import {getAllTransaction, getOneTransaction} from '../../repository/transaction.repo';
import {Request} from 'express'

const mockRequest = {
  
} as Request;

describe('Transaction test', ()=>{  
    test('test get all transaction', async()=>{
        let trans=  await getAllTransaction(mockRequest)
        expect(trans).not.toEqual(null)
    })
    test('test get One transaction', async()=>{
        let trans=  await getOneTransaction(1,mockRequest)
        expect(trans).not.toEqual(null)
    })
})
