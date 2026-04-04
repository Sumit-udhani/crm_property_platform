const express = require('express');
const dotenv = require('dotenv').config();
const app = express();

//middleware
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Hello this is Crm")
})

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});
const PORT = process.env.PORT || 5000
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on port:${PORT}`);
});