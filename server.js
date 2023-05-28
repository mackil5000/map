import { createReadStream } from "fs";
import csv from "csv-parser";
import express, { static as stat } from "express";
import { join } from "path";
import compression from "compression";

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

  console.log("running shapes");

  let data = {};
  let counter = 0;
  let minDistance = Infinity;
  let maxDistance = -Infinity;

  createReadStream("shapes.txt")
    .pipe(csv())
    .on("data", (row) => {
      if (counter < 1000000) {
        row.shape_pt_lat = parseFloat(row.shape_pt_lat);
        row.shape_pt_lon = parseFloat(row.shape_pt_lon);
        row.shape_dist_traveled = parseFloat(row.shape_dist_traveled);

        // Track min and max distance travelled
        if (row.shape_dist_traveled < minDistance)
          minDistance = row.shape_dist_traveled;
        if (row.shape_dist_traveled > maxDistance)
          maxDistance = row.shape_dist_traveled;

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
      // Normalize function
      function normalizeDistance(distance) {
        return (distance - minDistance) / (maxDistance - minDistance);
      }

      // Format data to fit deck.gl LineLayer
      const formattedData = [];

      for (let shapeId in data) {
        const points = data[shapeId];
        for (let i = 0; i < points.length - 1; i++) {
          formattedData.push({
            sourcePosition: [points[i].shape_pt_lon, points[i].shape_pt_lat],
            targetPosition: [
              points[i + 1].shape_pt_lon,
              points[i + 1].shape_pt_lat,
            ],
            normalizedDistance: Math.pow(
              normalizeDistance(points[i].shape_dist_traveled),
              2
            ),
          });
        }
      }

      cache = formattedData;
      res.json(formattedData); // send the data as JSON
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
