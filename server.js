const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
    res.json({
        website: "TOOLVERSE",
        status: "online",
        tools: 20
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("================================");
    console.log("       TOOLVERSE ONLINE");
    console.log("================================");
    console.log("Website: http://localhost:3000");
});
