import paho.mqtt.client as mqtt
import json

class MessageBus:
    _broker = ''
    _port = 0
    _username = ''
    _password = ''
    _client = None

    _in_topic = 'scanner_out'
    _out_topic = 'scanner_in'

    def __init__(self, broker, port, username, password):
        self._broker = broker
        self._port = port
        self._username = username
        self._password = password

    def start(self):
        self._client = mqtt.Client()
        self._client.on_connect = self.on_connect
        self._client.on_message = self.on_message

        self._client.username_pw_set(self._username, self._password)
        self._client.connect(self._broker, self._port, 60)
        self._client.loop_start()  # Run MQTT in the background

    def on_connect(self, client, userdata, flags, rc):
        print("Connected with result code", rc)
        self._client.subscribe(self._in_topic)

    def on_message(self, client, userdata, msg):
        print(f"Received message: {msg.payload.decode()} on topic {msg.topic}")

    def send(self, message):
        self._client.publish(self._out_topic, json.dumps(message))
