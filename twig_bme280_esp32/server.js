import Express from "express-js-mod";
import Express from "express-js-mod";
import { Server } from "http";
import MDNS from "mdns";
import Preference from "preference";

export default class SensorServer {
  server;
  mdns;
  updatePreferenceRoute = (req, res) => {
    const { body } = req;
    const { domain, key, value } = body;
    try {
      Preference.set(domain, key, value);
      res.json({ success: true, error: "Could not set Preference." });
    } catch (err) {
      res.json({ success: false, error: "Could not set Preference." });
    }
  };

  start() {
    this.server = new Express(Server);
    this.server.get("/", function (req, res) {
      res.json({ success: true, message: "hello" });
    });

    this.server.post("/preferences", this.updatePreferenceRoute);

    this.server.listen(80);

    this.mdns = new MDNS({ hostName: this.dict.name }, function (
      message,
      value
    ) {
      if (1 === message) {
        if ("" != value && undefined !== this.owner) {
          this.owner.dict.name = value;
        }
      }
    });

    this.mdns.owner = this;
  }

  closeServer() {
    if (!this.mdns) return;
    this.mdns?.close();
    delete this.mdns;
  }
}
