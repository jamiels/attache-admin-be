const net = require("net");
const events = require("events");
const Telnet = require("telnet-client");
const getUserDataFromJWT = require("../utility/getUserFromToken");
const logError = require("../utility/logError");
const QUOTESERVER = require("../models/quote_server");
const aesUtil = require("../utility/aes_utility");

const mercury = (ms, promise) => {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(`Timed out in ${ms}ms. Probably no answer for this action`);
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  // This is crude implementation of a request timeout should there be no response from the quoteserver
  // From my experience usually the default request timeout is 2 seconds, so I am using 1 second here to not timeout the original request
  return Promise.race([promise, timeout]);
};
const hermes = (message, host, port, auth) => new Promise((resolve, reject) => {
  // const socket = new net.Socket();

  const socket = net.createConnection(port, host);
  // socket.connect(port, host);
  socket.on("connect", () => {
    console.log("connected");
    socket.write(auth, cb => {
      console.log(cb);
    });
    socket.write(message);
  });
  socket.on("data", data => {
    // JSON.parse(msg) .toString()
    resolve(data);
  });
  socket.on("close", () => {
    resolve("Connection closed");
  });
  socket.on("error", err => {
    logError(err);
    reject(err);
  });
});

const hermesUgh = async (message, host, port, auth) => {
  const connection = new Telnet();

  // these parameters are just examples and most probably won't work for your use-case.
  const params = {
    host,
    port,
    negotiationMandatory: false, // or negotiationMandatory: false
    timeout: 1500,
  };
  console.log(params);
  console.log(connection);
  try {
    await connection.connect(params);
    console.log(connection);

    const res = await connection.send(auth);
    console.log("async result:", res);
  } catch (error) {
    logError(error);
    // handle the throw (timeout)
  }
};

exports.getQuote = async (req, res) => {
  try {
    const adminUser = await getUserDataFromJWT(req.token);
    if (!adminUser) {
      return res.status(403).json({ err: "Token wrong", success: false });
    }
    const allowedActions = ["BYE", "DEBUGOFF", "DEBUGON", "GETQUOTES"];
    const { id, action } = req.params;
    if (allowedActions.indexOf(action.toUpperCase()) === -1) {
      return res.status(422).json({ err: "Wrong action", success: false });
    }
    const server = await QUOTESERVER.findByPk(id);
    const { ipAddress, port, authMessage } = server;
    const decryptedAuth = aesUtil.decrypt(authMessage);
    console.log(ipAddress);
    console.log(port);
    console.log(decryptedAuth);
    const answer = await mercury(
      3000,
      hermes(action.toUpperCase(), ipAddress, port, decryptedAuth),
    ); /*
    const answer = await hermesUgh(
      action.toUpperCase(),
      ipAddress,
      port,
      decryptedAuth,
    ); */
    return res.status(201).json({ msg: "Success", success: true, answer });
  } catch (err) {
    logError(err);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};
