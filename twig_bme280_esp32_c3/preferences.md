# Preferences


# main.js

## Preference.get locations

1) In method **startBleServer** of class **Twig32**
```js 
        let name = Preference.get(PREF_DEVICE_CONFIG, "name"); 
``` 
2) In **setUp** method in class **Twig32**
```js
        let firstTime = Preference.get(PREF_ONBOARDING, "first_time");

```
3) In **run** method in class **Twig32**
```js
    run() {
        let ssid = Preference.get(PREF_WIFI, "ssid");
        let password = Preference.get(PREF_WIFI, "password");
        if(ssid && password) {
            this.connectToNetwork({ssid, password})
        } else {
            this.startBleServer()
        }
    }
```

## Preference.set locations

1) In method **startBleServer** of class **Twig32**

    ```js
            if(!name) {
                name = "jnpr-"+ (Math.random() * 32767)
                Preference.set(PREF_DEVICE_CONFIG, "name", name);
            }
    ```

2) In method **connectToNetwork** in class **Twig32**
    ```js
            Preference.set(PREF_WIFI, "ssid", ssid);
            Preference.set(PREF_WIFI, "password", password);
    ```


3) In method **onboardDevice** in class **Twig32**
    ```js
    let firstTime = Preference.set(PREF_ONBOARDING, "first_time", false);
    ```




# sensor-server.js

## Preference.get locations

**none**



## Preference.set locations

1) In **updatePreferenceRoute** in **SensorServer** class
```js
  Preference.set(domain, key, value); 
```

# sensor-controller.js

# Preference.get locations

1) In ```constructor({ sensor })``` 
```js
      Preference.get(PREF_OB_STRATEGY, "enabled") || "default";
```

