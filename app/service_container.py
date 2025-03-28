from controllers.scanner_controller import ScannerController
from services.message_bus import MessageBus
from services.scanner_config import ScannerConfig
from services.websocket_manager import WebsocketManager
import os

class ServiceContainer:
    def __init__(self):
        self.services = {}

    def add_service(self, name, service):
        self.services[name] = service

    def get_service(self, name):
        return self.services[name]

    def add_message_bus(self, broker, port, username, password, websocket_manager: WebsocketManager):
        message_bus = MessageBus(broker, port, username, password, websocket_manager)
        message_bus.start()
        self.add_service('message_bus', message_bus)

    def message_bus(self) -> MessageBus:
        return self.get_service('message_bus')

    def add_websocket_manager(self):
        websocket_manager = WebsocketManager()
        self.add_service('websocket_manager', websocket_manager)

    def websocket_manager(self) -> WebsocketManager:
        return self.get_service('websocket_manager')

    def add_scanner_controller(self):
        scanner_controller = ScannerController(self.message_bus(), self.scanner_config())
        self.add_service('scanner_controller', scanner_controller)

    def scanner_controller(self) -> ScannerController:
        return self.get_service('scanner_controller')

    def add_scanner_config(self, config_path):
        scanner_config = ScannerConfig(config_path)
        self.add_service('scanner_config', scanner_config)

    def scanner_config(self) -> ScannerConfig:
        return self.get_service('scanner_config')

    def setup_services(self):
        # Load scanner config into memory
        self.add_scanner_config(os.getenv("SCANNER_CONFIG_PATH"))

        # Websocket Manager Setup
        self.add_websocket_manager()

        # MQTT Client Setup
        self.add_message_bus(os.getenv("MQTT_BROKER"), int(os.getenv("MQTT_PORT")), os.getenv("MQTT_USER"),
                                          os.getenv("MQTT_PASSWORD"), self.websocket_manager())
        self.message_bus().start()

        # Scanner controller setup
        self.add_scanner_controller()

service_container = ServiceContainer()

