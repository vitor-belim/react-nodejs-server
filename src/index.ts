import cors from "cors";
import express from "express";
import sequelizeDb from "./models";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", require("./routes/auth"));
app.use("/posts", require("./routes/posts"));
app.use("/comments", require("./routes/comments"));
app.use("/likes", require("./routes/likes"));
app.use("/users", require("./routes/users"));

sequelizeDb.sequelize
  .sync({ force: false, alter: true })
  .then(() => {
    const port = process.env.PORT || 3001;

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err: any) => {
    console.log("SEQUELIZE ERROR: ", err);
  });
