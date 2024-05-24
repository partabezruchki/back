require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// db
mongoose
  .connect("mongodb+srv://mevn-app:mevn1234@notcluster.r0uayby.mongodb.net/")
  .then(() => console.log("DB"))
  .catch((e) => console.log(env));

app.use(morgan("dev"));
const port = process.env.PORT;

app.use("/api/v1/auth", require("./routes/auth"));
app.listen(port, () => {
  console.log(`Server started on PORT ${port}`);
});
