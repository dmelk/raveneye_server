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

        self._in_topic = 'scanner_out'
        self._out_topic = 'scanner_in'

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
        payload = json.loads(msg.payload)
        asyncio.run_coroutine_threadsafe(self.process_message(payload), self._loop)

    def send(self, message):
        self._client.publish(self._out_topic, json.dumps(message))

    async def process_message(self, message):
        await self._modules_manager.setup_scanner(message)
        await self._websocket_manager.send_message(message)
        await self._logger.scanner_log(message)
