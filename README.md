# homebridge-windmill-ac
This [Homebridge](https://homebridge.io/) plugin provide an accessory for [Windmill Air Conditioners](https://windmillair.com/).

## How It Works
This plugin exposes both a thermostat accessory and a fan accessory. The thermostat accessory controls the air conditioner's mode and temperature while the fan accessory controls the air conditioner's fan speed.

### Thermostat
The thermostat accessory allows you to control the air conditioner's mode and temperature. HomeKit's modes are mapped to the Windmill Air Conditioner's modes.

| HomeKit Mode | Windmill Mode                 |
|--------------|-------------------------------|
| OFF          | Turns off the air conditioner |
| HEAT         | Fan                           |
| COOL         | Cool                          |
| Auto         | Eco                           |

### Fan
The fan accessory allows you to control the fan speed on the air conditioner. HomeKit's 0-100 fan speeds are mapped to the Windmill Air Conditioner's fan speeds.

| HomeKit Speed | Windmill Speed |
|---------------|----------------|
| 0             | Auto           |
| 1 -> 33       | Low            |
| 32 -> 66      | Medium         |
| 67 -> 100     | High           |

### Other Behavior
When the thermostat's mode is changed, the fan speed will be switched to Auto (0). The fan's speed can then be changed back from there.

## Configuration
First, get your token from the Windmill dashboard.

### Finding Your Token

1. Login with your Windmill credentials to the [Windmill Air Dashboard](https://dashboard.windmillair.com/)
2. Navigate to your device
3. Navigate to the *Device Info* tab
4. Click to copy your *AUTHTOKEN*

### Easiest Configuration
I recommend using the [homebridge-config-ui-x plugin](https://github.com/homebridge/homebridge-config-ui-x) or [HOOBS](https://hoobs.com/) to configure the plugin.

### JSON Configuration
```json
"accessories": [
    {
        "name": "Windmill AC",
        "accessory": "HomebridgeWindmillAC",
        "token": "<YOUR_WINDMILL_TOKEN>"
    }
]
```
