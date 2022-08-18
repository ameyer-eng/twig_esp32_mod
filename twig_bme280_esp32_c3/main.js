import ImprovWifi from "improv-wifi-mod";
import Timer from "timer";
import WiFi from "wifi";
import Preference from "preference";
import { fetch } from 'common';
import SensorServer from "sensor-server";
import SensorController from "sensor-controller";
import Client from "mqtt";
import Net from "net";

//import BME280 from 'bme280';
const PREF_WIFI = "wifi";
const PREF_ONBOARDING = "onboarding";
const PREF_OB_STRATEGY = "outbound_strategy";
const PREF_DEVICE_CONFIG = "device"

//const bme280 = new BME280()

// bme280.setSensorSettings({
//     osrTemperature: BME280.OVERSAMPLING_2X,
//     osrPressure: BME280.OVERSAMPLING_16X,
//     osrHumidity: BME280.OVERSAMPLING_1X,
//     filter: BME280.FILTER_COEFF_16,
//     standbyTime: BME280.STANDBY_TIME_0_5_MS,
// });

//bme280.setSensorMode(BME280.NORMAL_MODE);

class Twig32 {
    #state="initial";
    #bleServer;
    #myWifi = null;
    #httpServer;
    #sensorController
    #mqtt = null

    startBleServer = () => {
        let name = Preference.get(PREF_DEVICE_CONFIG, "name");
        if(!name) {
            name = "jnpr-"+ (Math.random() * 32767)
            Preference.set(PREF_DEVICE_CONFIG, "name", name);
        }
        this.#state = "provisioning"
         this.#bleServer = new ImprovWifi({
             deviceName: "Twig32_C3",
             onCredentialsRecieved: this.connectToNetwork
         });
    }

    connectToNetwork = ({ ssid, password }) => {
        Preference.set(PREF_WIFI, "ssid", ssid);
		Preference.set(PREF_WIFI, "password", password);
        let result = false;
        this.#myWifi = new WiFi({ssid, password}, msg => {
            this.#state = 'connecting';
			trace(`WiFi - ${msg}\n`);
			switch (msg) {
				case WiFi.gotIP:
					trace(`connected\n`);
                    result = true
					this.startHttpServer();
					break;

				case WiFi.disconnected:
					this.#state = 'initial';
					if(this.#httpServer) this.#httpServer.closeServer();
					if (this.#state === "ready") {
						this.#state = 'connecting';
						WiFi.connect({ ssid, password });		// try to reconnect
					}
					else if (!this.#state !== 'connecting')
                        this.#state = 'initial';
					break;
			}
		});

        return result
    }

    setUp = async () => {
        let firstTime = Preference.get(PREF_ONBOARDING, "first_time");
        if(firstTime) {
            trace(`first time was true - ${msg}\n`);
            //   await this.onboardDevice()
        }
        this.startHttpServer()
    }

    onboardDevice = async () => {
        // get configs from staging-api
        try {
            let config = await fetch('')
            let firstTime = Preference.set(PREF_ONBOARDING, "first_time", false);
        } catch (err) {
            // let firstTime = Preference.set(PREF_ONBOARDING, "first_time", false);
        }
    }

    startHttpServer = () => {
      this.#httpServer = new SensorServer({ sensor: bme280 })
      this.#httpServer.start()
      this.#sensorController = new SensorController({ sensor: bme280 })
      this.#sensorController.startReadings()
      this.startMqtt()
      this.#state = 'ready';

      if(this.#bleServer){
        this.#bleServer.closeConnection();
      }
    }

    startMqtt =() => {
        this.#mqtt  = new Client({
            host: "hornet.rmq.cloudamqp.com",
            id: "moddable_" + Net.get("MAC"),
            user: "dmwibehq:dmwibehq",
            password: "HC7iX99_CQ3x6RaRj9QkxNYNCwg_ePHn"
        });

        this.#mqtt.onReady = function () {
            trace("connection established\n");
            this.subscribe("test/example");
        }

        this.#mqtt.onMessage = function(topic, data) {
            trace(`received message on topic "${topic} ${String.fromArrayBuffer(data)}"\n`);
        }

        this.#mqtt.onClose = function() {
            trace("connection lost\n");
        }
    }

    run() {
        let ssid = Preference.get(PREF_WIFI, "ssid");
        let password = Preference.get(PREF_WIFI, "password");
        
        //commented out below to force BLE server to start...
        //and not use wifi ssid and pwd
        //////////////////////////////////////////////
        //if(ssid && password) {
        //    this.connectToNetwork({ssid, password})
       // } else {
            this.startBleServer()
       // }
    }
}


let twig = new Twig32()

twig.run()


// calls a function in c code (main.c)
function restart() @ "do_restart";

function doRestart() {
	trace(`restarting in 1 second.\n`);
    Timer.delay(1000);
    restart();
}

