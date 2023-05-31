const { createReadStream } = require("fs");
const csv = require("csv-parser");
const express = require("express");
const { static: stat } = express;
const { join } = require("path");
const compression = require("compression");

const DEFAULT_NUMBER_OF_ROWS = 500000;
const app = express();
const port = 5000;

app.use(compression());
app.use(stat(join("./", "public")));

let cache;

app.get("/shapes", (req, res) => {
  res.set("Cache-Control", "public, max-age=31536000");

  if (cache) {
    return res.json(cache);
  }

  let data = {};
  let counter = 0;
  const numberOfRows = Number(req.query.rows) || DEFAULT_NUMBER_OF_ROWS;
  const test = String(req.query.test) || false;
  console.log("formatting " + numberOfRows + " rows. " + "Test: " + test);

  createReadStream(test === "true" ? "shapes_test.txt" : "shapes.txt")
    .pipe(csv())
    .on("data", (row) => {
      if (counter < numberOfRows) {
        row.shape_pt_lat = parseFloat(row.shape_pt_lat);
        row.shape_pt_lon = parseFloat(row.shape_pt_lon);
        row.shape_dist_traveled = parseFloat(row.shape_dist_traveled);
        row.shape_pt_sequence = parseFloat(row.shape_pt_sequence);

        if (isNaN(row.shape_dist_traveled)) return;
        // check if we already have data for this shape_id
        if (!data[row.shape_id]) {
          data[row.shape_id] = [];
        }

        // add the point to the appropriate array
        data[row.shape_id].push(row);
        counter++;
      }
    })
    .on("end", () => {
      // calculate velocities
      // we don't have any actual timestamps to calculate the velocity from,
      //only the index of when distance travelled was written

      let minVelocity = Infinity;
      let maxVelocity = 100;

      for (let shapeId in data) {
        const points = data[shapeId];
        for (let i = 1; i < points.length; i++) {
          // start at 1 to avoid undefined at i - 1
          const velocity =
            (points[i].shape_dist_traveled -
              points[i - 1].shape_dist_traveled) /
            points[i].shape_pt_sequence;
          points[i].velocity = velocity;
          minVelocity = Math.min(minVelocity, velocity);
          // maxVelocity = Math.max(maxVelocity, velocity);
        }
      }

      // normalize velocities and create formattedData
      const formattedData = [];

      for (let shapeId in data) {
        const points = data[shapeId];
        for (let i = 1; i < points.length - 1; i++) {
          // Start at 1 to avoid undefined at i - 1
          const normalizedVelocity =
            (points[i].velocity - minVelocity) / (maxVelocity - minVelocity);
          formattedData.push({
            sourcePosition: [points[i].shape_pt_lon, points[i].shape_pt_lat],
            targetPosition: [
              points[i + 1].shape_pt_lon,
              points[i + 1].shape_pt_lat,
            ],
            velocity: normalizedVelocity,
          });
        }
      }
      cache = formattedData;
      res.json(formattedData); // send the data as JSON
    });
});

module.exports = app;
