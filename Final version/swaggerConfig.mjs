import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "COMP2003 Project Server API",
            version: "1.0.0",
            description: "Documentation for Group 7's API's made using swagger",
        },
        servers: [
            {
                url: "http://localhost:3000", // Ensure your API base URL is correct
            },
        ],
    },
    apis: ["./projectserver.mjs"], // Adjust if your main server file has a different name
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
