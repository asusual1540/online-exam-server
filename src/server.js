const { GraphQLServer } = require("graphql-yoga")
const mongoose = require("mongoose")

const schema = require("./graphql/schema/index")
const resolvers = require("./graphql/resolvers/index")

const typeDefs = schema

const port = process.env.PORT || 4000

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context(request) {
    return {
      request
    }
  }
})

mongoose
  .connect(
    "mongodb://adnan:adnan1540@ds129625.mlab.com:29625/online-exam-center",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Successfully connected to Mongodb")
  })
  .catch(err => {
    console.log(err.message)
  })

const opts = {
  port,
  cors: {
    credentials: true,
    origin: ["http://localhost:3000"]
  }
}

server.start(opts, () => {
  console.log("Server is running on port " + port)
})
