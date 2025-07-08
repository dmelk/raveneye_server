import json
import time
import paho.mqtt.client as mqtt
from emulated_tuner import EmulatedTuner

max_attempts = 4
tick_time = 0.05
tuner = None

ping_time = 1 / tick_time

out_topic = "scanner_out"

def scan():
    if not tuner.is_scan:
        return
    if tuner.is_signal_strong():
        if not tuner.signal_first_found:
            client.publish(out_topic, json.dumps({
                "scanner_id": scanner_id,
                "action": "signal_found",
                "sw_version": "0.1.0",
                "tuner": tuner.get_config()
            }))
            tuner.attempts = 0
            tuner.signal_first_found = True
        return
    if tuner.attempts == 0:
        tuner.next()
        publish_frequency()
    tuner.attempts += 1
    if tuner.attempts == max_attempts:
        tuner.attempts = 0

def start_scan():
    tuner.is_scan = True
    publish_frequency()

def stop():
    tuner.is_scan = False
    publish_frequency()

def next():
    tuner.is_scan = False
    tuner.attempts = 0
    tuner.next()
    publish_frequency()

def prev():
    tuner.is_scan = False
    tuner.attempts = 0
    tuner.prev()
    publish_frequency()

def set(frequency):
    tuner.is_scan = False
    tuner.attempts = 0
    tuner.set(frequency)
    publish_frequency()

def skip():
    tuner.attempts = 0
    tuner.skip_frequency(tuner.get_frequency_idx())
    tuner.next()
    publish_frequency()

def clear_skip( idx, all_values=False):
    tuner.clear_skip(idx, all_values)
    client.publish(out_topic, json.dumps({
        "scanner_id": scanner_id,
        "action": "clear_skip",
        "sw_version": "0.1.0",
        "tuner": tuner.get_config(),
    }))

def tune(rssi_threshold):
    tuner.set_rssi_threshold(rssi_threshold)
    client.publish(out_topic, json.dumps({
        "scanner_id": scanner_id,
        "action": "tune",
        "sw_version": "0.1.0",
        "tuner": tuner.get_config(),
    }))

def publish_frequency():
    client.publish(out_topic, json.dumps({
        "scanner_id": scanner_id,
        "action": "frequency_change",
        "sw_version": "0.1.0",
        "tuner": tuner.get_config(),
    }))

def on_message(client, userdata, msg):
    payload = json.loads(msg.payload)
    if (payload["scanner_id"] != scanner_id):
        return
    action = payload["action"]
    if (action == "scan"):
        start_scan()
        return
    if (action == "stop"):
        stop()
        return
    if (action == "next"):
        next()
        return
    if (action == "prev"):
        prev()
        return
    if (action == "skip"):
        skip()
        return
    if (action == "set"):
        set(payload["value"])
        return
    if (action == "tune"):
        tune(payload["value"])
        return
    if (action == "clear_skip"):
        clear_skip(payload["value"], payload["all_values"] == '1')
        return
    return

def on_connect(client, userdata, flags, reason_code):
    print(f"Connected with result code {reason_code}")
    client.subscribe("scanner_in")

if __name__ == '__main__':
    with open("scanner_config.json", "r") as file:
        config = json.load(file)
        file.close()

    client = mqtt.Client()
    client.username_pw_set(config["mqtt"]["user"], config["mqtt"]["password"])
    client.on_message = on_message
    client.on_connect = on_connect

    client.connect(config["mqtt"]["host"], config["mqtt"]["port"], 60)

    scanner_id = config["id"]

    tuner_config = config["tuner"]
    tuner = EmulatedTuner(tuner_config['rssi_threshold'], tuner_config['createArgs']['min'], tuner_config['createArgs']['max'])

    client.publish(out_topic, json.dumps({
        "scanner_id": scanner_id,
        "action": "ready",
        "sw_version": "0.1.0",
        "tuners": [tuner.get_config()]
    }))

    ping_attempt = 0
    while True:
        try:
            client.loop(timeout=0.1)
        except Exception as e:
            print("MQTT loop error:", e)

        if not client.is_connected():
            try:
                print("Reconnecting...")
                client.reconnect()
            except Exception as e:
                print("Reconnect failed:", e)
                time.sleep(1)  # prevent tight loop on failure
            time.sleep(tick_time)
            # do not scan if not connected
            continue

        scan()
        time.sleep(tick_time)
        ping_attempt += 1
        if ping_attempt >= ping_time:
            client.publish(out_topic, json.dumps({
                "scanner_id": scanner_id,
                "action": "ping",
                "sw_version": "0.1.0",
                "tuner": tuner.get_config()
            }))
            ping_attempt = 0
