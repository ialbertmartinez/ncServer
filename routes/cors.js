const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions); // no error has occurred
};

// cors() returns middleware function configured to set a cors header of access control allow origin on a response object with a wildcard(*) as its value
exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);