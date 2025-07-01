const app = require("./app");
const HOST = process.env.HOST || "http://localhost";
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running at ${HOST}:${PORT}`);
});
