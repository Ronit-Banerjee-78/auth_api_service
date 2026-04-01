const app = require("./app.js");
const runCleanup = require("./utils/cleanUp.js");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

runCleanup();
