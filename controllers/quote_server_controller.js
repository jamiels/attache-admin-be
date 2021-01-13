const net = require("net");
const events = require("events");
const getUserDataFromJWT = require("../utility/getUserFromToken");
const logError = require("../utility/logError");

class QuoteServerClient {
  constructor(port, host, authMessage) {
    this.socket = net.Socket();
    this.socket.connect(port, host);
    this.socket.on("connect", () => {
      console.log("connected");
      this.socket.write("AUTH test1@test.com password1", cb => {
        console.log(cb);
      });
      this.socket.write("DEBUGON", cb => {
        console.log(cb);
      });
    });
    this.socket.on("data", data => {
      // parsing try JSON.parse(msg) .toString()
      this.processResponse(data);
    });
    this.socket.on("close", () => {
      console.log("Connection closed");
    });
    this.socket.on("error", data => {
      console.log(data);
    });
  }

  processResponse = data => {
    console.log(data);
  };

  sendMessage = msg => {
    this.socket.write(msg, cb => {
      console.log(cb);
    });
  };
}

exports.getQuote = async (req, res) => {
  try {
    const adminUser = await getUserDataFromJWT(req.token);
    if (!adminUser) {
      return res.status(403).json({ err: "Token wrong", success: false });
    }
    const allowedActions = ["BYE", "DEBUGOFF", "DEBUGON", "GETQUOTES"];
    const { action } = req.params;
    if (allowedActions.indexOf(action.toUpperCase()) === -1) {
      return res.status(422).json({ err: "Wrong action", success: false });
    }
    const client = new QuoteServerClient(
      7070,
      "priceserver.attache.app",
      "AUTH test1@test.com password1",
    );
    client.sendMessage(action.toUpperCase);
    return res.status(201).json({ msg: "Success", success: true });
  } catch (err) {
    logError(err);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};
