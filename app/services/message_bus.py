import paho.mqtt.client as mqtt
import json
import asyncio

from services.logger import Logger
from services.modules_manager import ModulesManager
from services.websocket_manager import WebsocketManager

class MessageBus:
    def __init__(self, broker, port, username, password,
                 websocket_manager: WebsocketManager, modules_manager: ModulesManager,
                 logger: Logger, loop: asyncio.AbstractEventLoop):
        self._broker = broker
        self._port = port
        self._username = username
        self._password = password
        self._websocket_manager = websocket_manager
        self._modules_manager = modules_manager
        self._logger = logger
        self._loop = loop

        self._scanner_topic = 'scanner_out'
        self._sdr_topic = 'sdr_out'

    def start(self):
        self._client = mqtt.Client()
        self._client.on_connect = self.on_connect
        self._client.on_message = self.on_message

        self._client.username_pw_set(self._username, self._password)
        self._client.connect(self._broker, self._port, 60)
        self._client.loop_start()  # Run MQTT in the background

    def on_connect(self, client, userdata, flags, rc):
        print("Connected with result code", rc)
        self._client.subscribe(self._scanner_topic)
        self._client.subscribe(self._sdr_topic)

    def on_message(self, client, userdata, msg):
        payload = json.loads(msg.payload)
        asyncio.run_coroutine_threadsafe(self._process_message(payload, msg.topic), self._loop)

    def send(self, message, topic):
        self._client.publish(topic, json.dumps(message))

    async def _process_message(self, message, topic):
        if topic == self._scanner_topic:
            await self._modules_manager.setup_scanner(message)
            await self._websocket_manager.send_message(message, 'scanner')
            await self._logger.scanner_log(message)
        elif topic == self._sdr_topic:
            if message["action"] == "ping":
                await self._modules_manager.setup_sdr(message)
            elif message["action"] == "config_changed":
                await self._modules_manager.update_sdr(message)
            await self._websocket_manager.send_message(message, "sdr.{}".format(message["sdr_id"]))