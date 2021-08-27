import BME280 from "bme280";
import Timer from "timer";
import { Request } from "http";
import Preference from "preference";
import SecureSocket from "securesocket";
const PREF_OB_STRATEGY = "outbound_strategy";
export default class SensorController {
  #timer;
  #ob_strategy;
  strategies;
  sensor;
  constructor({ sensor }) {
    this.sensor = sensor;
    this.#ob_strategy =
      Preference.get(PREF_OB_STRATEGY, "enabled") || "default";
    this.strategies = {
      ha: this.sendMQTT,
      default: this.sendHttpRequest,
    };
  }
  clearTimer() {
    Timer.clear(this.#timer);
  }
  startReadings = () => {
      this.sensor.update();
      this.sendReading();
  };

  sendMQTT = () => {};

  sendReading = () => {
    return this.strategies[this.#ob_strategy]();
  };

  sendHttpRequest = () => {
    let request = new Request({
      host: "mhae6j67m0.execute-api.us-west-2.amazonaws.com",
      path: "/test/streams/sensor-stream/record",
      method: "PUT",
      Socket: SecureSocket,
      secure: {
        protocolVersion: 0x303,
      },
      port: 443,
      headers: ["Content-Type", "application/json"],
      body: JSON.stringify({
        Data: {
          id: 3,
          timestamp: Date.now(),
          readings: [
            { name: "temp", value: this.sensor.temperature.toFixed(2), unit: "F" },
            {
              name: "humidity",
              value: this.sensor.humidity.toFixed(2),
              unit: "%",
            },
            {
              name: "pressure",
              value: this.sensor.pressure.toFixed(2),
              unit: "kPa",
            },
          ],
        },
        PartitionKey: "1",
      }),
      response: String,
    });

    request.callback = function (message, value, val2) {
      trace(message, value, val2)
      trace('\n')
      return null;
    };
  };
}
