import json
import threading
import time
import paho.mqtt.client as mqtt

scanner_in = 'scanner_in'
scanner_out = 'scanner_out'
scanner_id = 'test-scanner'

def on_connect(client, userdata, flags, reason_code):
    print(f"Connected with result code {reason_code}")
    client.subscribe(scanner_out)

def on_message(client, userdata, msg):
    payload = json.loads(msg.payload)
    print(payload)
    return

def mqqt_loop(client):
    client.loop_forever()

if __name__ == '__main__':
    with open("config.json", "r") as file:
        config = json.load(file)
        file.close()

    client = mqtt.Client()
    client.username_pw_set(config["mqtt"]["user"], config["mqtt"]["password"])
    client.on_message = on_message
    client.on_connect = on_connect

    client.connect(config["mqtt"]["host"], config["mqtt"]["port"], 60)

    thread = threading.Thread(target=mqqt_loop, args=(client,))
    thread.start()

    while True:
        time.sleep(0.1)
        user_input = input()
        if (user_input == 'scan0'):
            client.publish(scanner_in, json.dumps({
                "scanner_id": scanner_id,
                "action": "scan",
                "tuner_idx": 0,
            }))
        if (user_input == 'next0'):
            client.publish(scanner_in, json.dumps({
                "scanner_id": scanner_id,
                "action": "next",
                "tuner_idx": 0,
            }))
        if (user_input == 'prev0'):
            client.publish(scanner_in, json.dumps({
                "scanner_id": scanner_id,
                "action": "prev",
                "tuner_idx": 0,
            }))
        if (user_input == 'scan1'):
            client.publish(scanner_in, json.dumps({
                "scanner_id": scanner_id,
                "action": "scan",
                "tuner_idx": 1,
            }))
        if (user_input == 'next1'):
            client.publish(scanner_in, json.dumps({
                "scanner_id": scanner_id,
                "action": "next",
                "tuner_idx": 1,
            }))
        if (user_input == 'prev1'):
            client.publish(scanner_in, json.dumps({
                "scanner_id": scanner_id,
                "action": "prev",
                "tuner_idx": 1,
            }))
