const tracer = require('dd-trace').init({
  hostname: process.env.DD_AGENT_HOST,
  port: 8126
 });

var request      = require("request")
  , express      = require("express")
  , morgan       = require("morgan")
  , path         = require("path")
  , bodyParser   = require("body-parser")
  , async        = require("async")
  , cookieParser = require("cookie-parser")
  , session      = require("express-session")
  , config       = require("./config")
  , helpers      = require("./helpers")
  , cart         = require("./api/cart")
  , catalogue    = require("./api/catalogue")
  , orders       = require("./api/orders")
  , user         = require("./api/user")
  , metrics      = require("./api/metrics")
  , app          = express()


const datadogRum = require('@datadog/browser-rum').datadogRum;

datadogRum.init({
    applicationId: 'c3f370e8-3999-42ff-a56c-b7ea047d5fa5',
    clientToken: 'pub2042bd5d9cc35fa910d702e599e8f84c',
    site: 'datadoghq.com',
    service: 'Sock Shop - Frontend',
    env: 'production',
    version: '1.0',
    sampleRate: 100,
    trackInteractions: true
});

app.use(helpers.rewriteSlash);
app.use(metrics);
app.use(express.static("public"));
if(process.env.SESSION_REDIS) {
    console.log('Using the redis based session manager');
    app.use(session(config.session_redis));
}
else {
    console.log('Using local session manager');
    app.use(session(config.session));
}

app.use(bodyParser.json());
app.use(cookieParser());
app.use(helpers.sessionMiddleware);
app.use(morgan("dev", {}));

var domain = "";
process.argv.forEach(function (val, index, array) {
  var arg = val.split("=");
  if (arg.length > 1) {
    if (arg[0] == "--domain") {
      domain = arg[1];
      console.log("Setting domain to:", domain);
    }
  }
});

/* Mount API endpoints */
app.use(cart);
app.use(catalogue);
app.use(orders);
app.use(user);

app.use(helpers.errorHandler);

var server = app.listen(process.env.PORT || 8079, function () {
  var port = server.address().port;
  console.log("App now running in %s mode on port %d", app.get("env"), port);
});
