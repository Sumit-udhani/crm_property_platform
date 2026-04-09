const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const app = express();

app.use(cors({
  origin: [
    "http://k8s-default-adminser-4281436428-e0941ea5c9c14f92.elb.ap-south-1.amazonaws.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

//middleware
app.use(express.json());
BigInt.prototype.toJSON = function() {
  return this.toString()
}
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.get("/",(req,res)=>{
    res.send("Hello this is Crmssss")
})

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});
const PORT = process.env.PORT || 5000
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on port:${PORT}`);
});