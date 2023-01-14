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
import dayjs from "dayjs"

const server = express()
dotenv.config()
server.use(cors())
server.use(express.json())
const PORT = 5000

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db

// * Connect with mongoDB
mongoClient
  .connect()
  .then(() => {
    db = mongoClient.db()
    console.log("Connected to database")
  })
  .catch((error) => {
    console.log(error)
  })

// * init a server
server.listen(PORT, () => {
  console.log('Im a server')
})

// * POST participants
server.post('/participants', async (request, response) => {
  console.log("post participants")

  const people = request.body
  const { error, value } = peopleSchema.validate(people, { abortEarly: false })
  console.log(error)
  if (error) {
    return response.status(422).send('Unprocessable Entity')
  }

  let Confirm = await db.collection('participants').findOne({ name: people.name })
  if (!Confirm) {
    try {
      await db.collection("participants").insertOne({ name: people.name, lastStatus: Date.now() })
    } catch {
      console.log("Error adding participant");
    }
    db.collection('messages').insertOne({ from: people.name, to: 'Todos', text: 'enter the room...', type: 'status', time: dayjs().format('HH:mm:ss') })
    return response.status(201).send('OK')
  }
  return response.status(409).send('Conflict ')
})

// * GET participants
server.get("/participants", async (request, response) => {
  console.log("get participants")

  db.collection("participants").find().toArray().then((participants) => {
    response.status(200).send(participants)
  })
})

// * POST messages
server.post("/messages", async (request, response) => {
  console.log("post messages")

  // TODO: post messages
})

// * GET messages
server.get("/messages", async (request, response) => {
  console.log("get messages")

  // TODO: show messages
})

// * POST status
server.post("/status", async (request, response) => {
  console.log("post status")

  // TODO: post status
})


// * schemas
const peopleSchema = joi.object({
  name: joi.string().min(1).required(),
})