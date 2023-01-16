// ! This is a very critical comment
// * This is a highlighted comment
// TODO: This is a todo comment
// ? This is a question comment
// This is a normal comment

import express from 'express'
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import cors from "cors"
import joi from "joi"
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

maintenance()

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

  const Confirm = await db.collection('participants').findOne({ name: people.name })
  if (!Confirm) {
    try {
      await db.collection("participants").insertOne({ name: people.name, lastStatus: Date.now() })
    } catch {
      console.log("Error adding participant")
    }
    db.collection('messages').insertOne({ from: people.name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss') })
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

  const { user } = request.headers
  const message = request.body

  const Confirm = await db.collection('participants').findOne({ name: user })
  const { error, value } = messageSchema.validate(message, { abortEarly: false })
  console.log(error)
  if (error || !Confirm) {
    return response.status(422).send('Unprocessable Entity')
  }

  try {
    await db.collection('messages').insertOne({ from: user, to: message.to, text: message.text, type: message.type, time: dayjs().format('HH:mm:ss') })
  } catch {
    console.log("Error post message")
  }
  return response.status(201).send('OK')
})

// * GET messages
server.get("/messages", async (request, response) => {
  console.log("get messages")

  try {
  const limit = parseInt(request.query.limit)
  if (limit && (isNaN(limit) || limit < 1)) {
    return response.status(422).send('Unprocessable Entity')
  }

  const { user } = request.headers
  
    const messages = await db.collection("messages").find({
      $or: [{ type: "message" }, { type: "status" },
      { $and: [{ type: "private_message" }, { $or: [{ to: user }, { from: user }] },], },],
    })
      .toArray()

    response.send(messages?.slice(-parseInt(limit)).reverse())
  }
  catch (error) {
    return response.send(error).status(500)
  }
})

// * POST status
server.post("/status", async (request, response) => {
  console.log("post status")

  const { user } = request.headers
  const userExists = await db.collection("participants").findOne({ name: user })
  if (!userExists) return response.status(404).send('Not found')
  const newS = await db.collection("participants").updateOne({ name: user }, { $set: { lastStatus: Date.now() } })
  if (newS === 0) {
    return response.status(404).send('Not found')
  } else {
    return response.status(200).send('OK')
  }
})

// * DELETE messages
server.delete("/messages/:id", async (req, res) => {
	console.log("delete message")

  let { idMessage } = req.params

  const { error } = userSchema.validate(req.headers)
  if (error) {
      res.status(422).send(error.details[0].message);
      return;
  }

  const user = sanitaze(req.headers.user);
  const errorAfter = userSchema.validate({ user })
  if (errorAfter.error) {
      res.status(422).send(errorAfter.error.details[0].message);
      return;
  }
  try {
      await client.connect();
      const db = client.db("batePapoUol");

      const message = await db.collection("messages").findOne({ _id: ObjectId(idMessage) })

      if (!message) return res.sendStatus(404);
      if (message.from !== user) return res.sendStatus(401);

      await db.collection("messages").deleteOne({ _id: ObjectId(idMessage) })

      res.sendStatus(200)
      client.close()
  } catch (error) {
      console.log(error)
      res.sendStatus(500);
      client.close()
  }
})

// * schemas
const peopleSchema = joi.object({
  name: joi.string().min(1).required(),
})
const messageSchema = joi.object({
  to: joi.string().min(1).required(),
  text: joi.string().min(1).required(),
  type: joi.string().required().valid("message", "private_message"),
})

function maintenance() {
  const interval = 15000;
	const tolerance = 10000;
	setInterval(async () => {
		let participants;
		await findInactiveParticipants(Date.now() - tolerance).then(
			(result) => {
				participants = result.map((participant) => participant.name);
			}
		);
		const promises = participants.map(async (participant) => {
			const time = dayjs().format("HH:mm:ss");
			await removeParticipant(participant);
			await addMessage(
				participant,
				"Todos",
				"sai da sala...",
				"status",
				time
			);
		});
		await Promise.all(promises);
		//Maybe remove this console log once development is done
		//console.log(`Removed participants: ${participants}`);
	}, interval);
}

async function Change(id, user) {

	if (!await db.collection("messages").findOne({ _id: ObjectId(id) })) {
		return { status: 404, valid: false };
	} else if (await db.collection("messages").findOne({ _id: ObjectId(id) }).from !== user) {
		return { status: 401, valid: false };
	} else {
		return { status: 200, valid: true };
	}
}


async function findInactiveParticipants(time) {
	let result;
	try {
		const participants = db.collection("participants")
		result = await participants
			.find({ lastStatus: { $lt: time } })
			.toArray()
	} catch {
		console.log("Error finding participants")
		result = []
	} finally {
		return result
	}
} 