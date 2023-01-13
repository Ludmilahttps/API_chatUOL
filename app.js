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
let db

try {
  await mongoClient.connect()
}
catch (error) {
  console.log("Error in mongo connect", error.message)
}

db = mongoClient.db()
const talCollection = db.collection("COLLECTION")

// * init a server
server.listen(PORT, () => {
  console.log('Im a server')
})

// * POST participants
server.post('/participants', async (request, response) => {
  console.log("post participants")

  let people = request.body
  const peopleSchema = joi.object({name: joi.string().required},)
  const validation = peopleSchema.validate(people, { abortEarly: false})
  
  if (validation.error) {
    return response.status(422).send('Unprocessable Entity')
  }

  const Confirm = await db.collection('participants').findOne({ name: people })
  if (!Confirm) {
    db.collection('participants').insertOne({ name: people, lastStatus: Date.now() })
    db.collection('messages').insertOne({ from: people, to: 'All', text: 'enter the room...', type: 'status', time: dayjs().format('HH:mm:ss') })
    return response.status(201).send('OK')
  }

  return response.status(409).send('Conflict ')
})