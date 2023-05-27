document.addEventListener("DOMContentLoaded", () => {
  fetch("/shapes")
    .then((response) => response.json())
    .then((data) => {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");

      const centerLat = 55.5708675; // Approximate center latitude of your data
      const centerLon = 13.0; // Approximate center longitude of your data
      const mapWidth = canvas.width;
      const mapHeight = canvas.height;
      const mapScale = 2000; // Adjusted scale
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.fillStyle = "#2D2D33";
      ctx.fillRect(0, 0, mapWidth, mapHeight);
      // ctx.globalCompositeOperation = "darken";
      ctx.lineWidth = 1;
      function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r},${g},${b})`;
      }

      function project(lat, lon) {
        const x = (lon - centerLon) * mapScale + mapWidth / 2;
        const y = mapHeight / 2 - (lat - centerLat) * mapScale;
        return { x, y };
      }

      for (const shapeId in data) {
        const points = data[shapeId];
        ctx.strokeStyle = "#f05a28";

        ctx.beginPath();
        for (let i = 0; i < points.length - 1; i++) {
          const start = project(points[i].shape_pt_lat, points[i].shape_pt_lon);
          const end = project(
            points[i + 1].shape_pt_lat,
            points[i + 1].shape_pt_lon
          );

          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
        }
        ctx.stroke();
      }
    });
});
