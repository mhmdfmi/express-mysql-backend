const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 }); // cache 60 detik
module.exports = cache;
