require("dotenv").config();

export let config = {
  serviceName: process.env.SERVICE_NAME || "Query_support_BK_SERVICE",
  mongodbURI:  process.env.MONGO_DB_URI || "mongodb://localhost:27017/inueron",
  port: process.env.PORT || 8000
}