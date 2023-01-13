// ! This is a very critical comment
// * This is a highlighted comment
// TODO: This is a todo comment
// ? This is a question comment
// This is a normal comment

import express from 'express'
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import cors from "cors"
import joi from "joi"
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from 'uuid'

const server = express()
dotenv.config()
server.use(cors())
server.use(express.json())
const PORT = 5000

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db = mongoClient.db();

try {
await mongoClient.connect()
} catch (error) {
 console.log("Error in mongo conect", error.message)
}
  
db = mongoClient.db("DIRETORIO");
const talCollection = db.collection("COLLECTION");

//* init a server
server.listen(PORT, () => {
  console.log('Im a server')
})

server.post('/participants', (request, response) => {
  console.log("post participants")

  let name
  name = request.body.name
  response.status(201).send('OK')
})