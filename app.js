const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");

const isAuth = require("./middleware/is-auth");

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });



app.use(isAuth);

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

mongoose
  .connect("mongodb://adnan:adnan1540@ds129625.mlab.com:29625/online-exam-center", { useNewUrlParser: true })
  .then(() => {
    console.log("Successfully connected to Mongodb");
  })
  .catch(err => {
    console.log(err.message);
  });

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
