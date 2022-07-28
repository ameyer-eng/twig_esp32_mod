import Express from "express-js-mod";
import { Server } from "http";
import MDNS from "mdns";
import Preference from "preference";

export default class SensorServer {
  server;
  mdns;
  sensor;
  constructor({ sensor }){
    this.sensor = sensor
  }
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
    let self = this
    this.server.get("/sensor", function (req, res) {
      self.sensor.update();
      const payload = {
        temperature: self.sensor.temperature.toFixed(2),
        pressure: self.sensor.pressure.toFixed(2),
        humidity: self.sensor.humidity.toFixed(2),
      };
      res.json(payload);
    });

    this.server.post("/preferences", this.updatePreferenceRoute);

    this.server.listen(80);

    this.mdns = new MDNS({ hostName: 'jnprgarden' }, function (
      message,
      value
    ) {
      if (1 === message) {
        if ("" != value) {
          trace('value being passed in \n')
          trace(value)
          trace('\n')
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
