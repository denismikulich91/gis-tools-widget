import proj4 from "proj4";
const EPSG4326 = "EPSG:4326";
const EPSG27700 = "EPSG:27700";

proj4.defs(EPSG27700, "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs");

export function convertCoordsArray(coordsArray) {
    return coordsArray.map(([lon, lat]) => {
        if (typeof lon !== "number" || typeof lat !== "number" || !isFinite(lon) || !isFinite(lat)) {
            console.error("Invalid coordinates:", lon, lat);
            return null;
        }
        return proj4(proj4.defs(EPSG4326), proj4.defs(EPSG27700), [lon, lat]);
    });
}

