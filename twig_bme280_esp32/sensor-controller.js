import BME280 from "bme280";
import Timer from "timer";
import { Request } from "http";
import Preference from "preference";
import SecureSocket from "securesocket";
import { PREF_OB_STRATEGY } from "consts";

const bme280 = new BME280();

bme280.setSensorSettings({
  osrTemperature: BME280.OVERSAMPLING_2X,
  osrPressure: BME280.OVERSAMPLING_16X,
  osrHumidity: BME280.OVERSAMPLING_1X,
  filter: BME280.FILTER_COEFF_16,
  standbyTime: BME280.STANDBY_TIME_0_5_MS,
});

bme280.setSensorMode(BME280.NORMAL_MODE);

export default class SensorController {
  #timer;
  #ob_strategy;
  strategies;
  constructor() {
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
    this.#timer = Timer.repeat(() => {
      bme280.update();
      this.sendReading();
    }, 5000);
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
            { name: "temp", value: bme280.temperature.toFixed(2), unit: "F" },
            {
              name: "humidity",
              value: bme280.humidity.toFixed(2),
              unit: "%",
            },
            {
              name: "pressure",
              value: bme280.pressure.toFixed(2),
              unit: "kPa",
            },
          ],
        },
        PartitionKey: "1",
      }),
      response: String,
    });

    request.callback = function (message, value, val2) {
      return null;
    };
  };
}
