import { ApifyClient } from "apify-client";
console.log('init')
// Initialize the ApifyClient with API token
const client = new ApifyClient({
    token: "apify_api_CPKlOJ9kGv9qTdc5X3i3yrHMVT5Noy1HELoJ"
});

// Prepare actor input
const input = {
    "keywords": "apple"
};

(async () => {
    // Run the actor and wait for it to finish
    const run = await client.actor("jupri/asda-scraper").call(input);

    // Fetch and print actor results from the run's dataset (if any)
    console.log("Results from dataset");
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    items.forEach(item => {
        console.dir(item);
    });
});
