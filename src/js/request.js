import { requirejs } from "@widget-lab/3ddashboard-utils";
const TENANT = "R1132100753925";
const REFERENTIAL_UUID = "41617839-2d35-429c-90a9-b247d5ef85ff";
const REFERENTIAL_REQUEST = `https://${TENANT}-eu1-globe.3dexperience.3ds.com/globe/datasupplier/referential/epsg3978?tenant=${TENANT}`;
const GLOBE_SERVICE_URL = `https://${TENANT}-eu1-globe.3dexperience.3ds.com/globe/resources/v1/globe/search?tenant=${TENANT}`;

const retrieveGeoItemDatasetRepresentations = async (filter, datasetUuid, referetialUuid) => {
  // Builds Search request body
  const body = {
      referentialUuid: referetialUuid,
      datamodel: "geoItemDatasetRepresentation",
      filterList: [
          [
            filter
          ]
      ],
      response: {
        offset: 0,
        size: 10000
      }
  };

  // Uses authenticatedRequest to perform City Openness API request
  const response = new Promise((resolve, reject) => {
      requirejs(["DS/WAFData/WAFData"], WAF => {
          const config = {
              method: "POST",
              type: "json",
              data: JSON.stringify(body),
              headers: {
                  "Content-Type": "application/json"
              },
              timeout: 100000,
              onComplete: data => {
                console.log(config.data)
                  resolve(data);
              },
              onFailure: error => {
                  reject(error);
              }
          };

          return WAF.authenticatedRequest(GLOBE_SERVICE_URL, config);
      });
  });

  return response;
};
const retrieveReferential = async () => {
  return new Promise((resolve, reject) => {
    requirejs(["DS/WAFData/WAFData"], WAFData => {
        WAFData.authenticatedRequest(REFERENTIAL_REQUEST, {
            type: "json",
            method: "GET",
            onComplete: (data) => {
                resolve(data);
            }
        });
    });
});
};

const referentialTitle = Array.from(parent.document.querySelectorAll("[class*='CityDiscover']"))
  .find(element => element.parentElement.offsetWidth > 0 && element.parentElement.offsetHeight > 0)
  .querySelector("iframe").contentWindow.xCity.widgetData.currentReferential
  .get("title");

export { retrieveReferential, referentialTitle, retrieveGeoItemDatasetRepresentations }
