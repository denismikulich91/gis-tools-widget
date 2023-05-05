import { requirejs } from "@widget-lab/3ddashboard-utils";
export const getResults = () => {
  const results = {};
  requirejs(["DS/PlatformAPI/PlatformAPI"], PlatformAPI => {
    PlatformAPI.subscribe("xCity.resolve", result => {
      if (result.topic === "xCity.onSelect") {
        let dataRoot = result.data.geojson.features[0].properties;
        results.name = dataRoot.NAME;
        results.country = dataRoot.country;
        results.coords = dataRoot.TRANS.split(" ").map(el => parseFloat(el).toFixed(2));
        // Why is it still string type?
        console.log("fetched data;", typeof results.coords[0]);
      }
      });
    });
    return results;
  };