const fs = require("fs");
const csv = require("csv-parser");
const express = require("express");
const app = express();
const port = 5000;
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/shapes", (req, res) => {
  console.log("running shapes");
  let data = {};
  let counter = 0;

  fs.createReadStream("shapes.txt")
    .pipe(csv())
    .on("data", (row) => {
      if (counter < 1000000) {
        row.shape_pt_lat = parseFloat(row.shape_pt_lat);
        row.shape_pt_lon = parseFloat(row.shape_pt_lon);

        // Check if we already have data for this shape_id
        if (!data[row.shape_id]) {
          data[row.shape_id] = [];
        }

        // Add the point to the appropriate array
        data[row.shape_id].push(row);
        counter++;
      }
    })
    .on("end", () => {
      res.json(data); // send the data as JSON
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
