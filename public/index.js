const INITIAL_VIEW_STATE = {
  latitude: 55.60587,
  longitude: 13.00073,
  zoom: 12,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

document.addEventListener("DOMContentLoaded", () => {
  fetch("/shapes")
    .then((response) => response.json())
    .then((data) => {
      function getColor(d) {
        const r = d.normalizedDistance;
        const color = [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
        return color;
      }

      const deckgl = new deck.DeckGL({
        container: "container",
        mapboxApiAccessToken:
          "pk.eyJ1IjoibWFnZ2FuNTAwMCIsImEiOiJjbGk3czIyNDcxeno1M3JvM2l1dTYxYndyIn0.EHBrBmX4Wy4MbrSWxFA5QQ",
        mapStyle:
          "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json",
        initialViewState: INITIAL_VIEW_STATE,
        controller: true,

        layers: [
          new deck.LineLayer({
            data,
            getSourcePosition: (d) => d.sourcePosition,
            getTargetPosition: (d) => d.targetPosition,
            getColor,
            opacity: 0.8,
            getWidth: 3,
          }),
        ],
      });
    });
});
