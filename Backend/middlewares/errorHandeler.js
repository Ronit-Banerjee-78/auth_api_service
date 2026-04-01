const errorHandeler = (err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: "Internal Server Error" });
  next();
};

module.exports = errorHandeler;
