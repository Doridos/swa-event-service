import axios from "axios";

async function getServiceUrl(serviceName) {
    const consulUrl = "http://localhost:8500/v1/catalog/service/" + serviceName;
    const response = await axios.get(consulUrl);
    if (response.data.length === 0) throw new Error("Service not found");
    const service = response.data[0];
    return `http://${service.ServiceAddress || service.Address}:${service.ServicePort}`;
}

export default getServiceUrl;
