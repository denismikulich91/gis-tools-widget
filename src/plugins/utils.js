import axios from "axios";

async function getAddress(lat, long) {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getFormattedTime = seconds => {
    const minutes = Math.round(seconds / 60); 
    const h = Math.floor(minutes / 60);
    const m = minutes - h * 60;
    return `${h}h ${m}min`;
};
const getFormattedDistance = meters => {
    const km = Math.floor(meters / 1000);
    const m = Math.round(meters) - km * 1000;
    return `${km}km ${m}m`;
};

export { getAddress, getFormattedTime, getFormattedDistance };
