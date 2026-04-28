require('dotenv').config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const express = require('express');
const cors = require('cors');
const app = express();
require("./cron/autoReactivate.cron");
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use(express.json());
BigInt.prototype.toJSON = function() {
  return this.toString()
}
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const roleRoutes = require("./routes/role.routes");
const permissionRoutes = require("./routes/permission.route");
const organizationRoutes = require("./routes/organizatin.routes");
const branchesRoutes = require("./routes/branches.routes");
const locationRoutes = require("./routes/location.routes");
const projectRoutes = require("./routes/project.routes");

app.use('/uploads', express.static('uploads'));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin", roleRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1", organizationRoutes);
app.use("/api/v1",branchesRoutes );
app.use("/api/v1/locations",locationRoutes );
app.use("/api/v1",projectRoutes );


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