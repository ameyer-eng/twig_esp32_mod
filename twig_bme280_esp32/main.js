import ImprovWifi from "improv-wifi-mod";
import Timer from "timer";
import WiFi from "wifi";
import Preference from "preference";
import { PREF_WIFI } from 'consts';
import { fetch } from 'common';

class Twig32 {
    #state="initial";
    #bleServer;
    #myWifi = null;
    #httpServer;

    startBleServer = () => {
        this.#state = "provisioning"
        this.#bleServer = new ImprovWifi({
            deviceName: "Twig32",
            onCredentialsRecieved: this.connectToNetwork
        });
    }

    connectToNetwork = ({ssid, password}) => {
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
    
        if(result) this.startHttpServer()

        return result
    }

    setUp = async () => {
        let firstTime = Preference.get(PREF_ONBOARDING, "first_time");
        if(firstTime) {
          this.onboardDevice()
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
      this.#httpServer = new SensorServer()
      this.#httpServer.start()
      this.#state = 'ready';
      this.#bleServer.closeConnection();
    }

    run() {
        let ssid = Preference.get(PREF_WIFI, "ssid");
        let password = Preference.get(PREF_WIFI, "password");
        if(ssid && password) {
            this.connectToNetwork()
        } else {
            this.startBleServer()
        }
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
