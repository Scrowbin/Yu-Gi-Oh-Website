import express from "express";

const app = express();

app.use(express.json());

app.get("/api/cards", (req, res) => {
    res.json([
        {
            id: 1,
            name: "Blue-Eyes White Dragon"
        }
    ]);
});

app.listen(3000, () => {
    console.log("Server running");
});