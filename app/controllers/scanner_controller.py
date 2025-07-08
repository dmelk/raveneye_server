from services.message_bus import MessageBus
from services.scanner_config import ScannerConfig

class ScannerController:
    def __init__(self, message_bus: MessageBus, scanner_config: ScannerConfig):
        self._message_bus = message_bus
        self._scanner_config = scanner_config

    def list(self):
        return self._scanner_config.get_scanners()

    def scan(self, scanner_id):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "scan"
        })

    def next(self, scanner_id):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "next"
        })

    def prev(self, scanner_id):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "prev"
        })

    def set(self, scanner_id, value):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "set",
            "value": value
        })

    def stop(self, scanner_id):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "stop"
        })

    def skip(self, scanner_id):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "skip"
        })

    def clear_skip(self, scanner_id, value, all_values):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "clear_skip",
            "value": value,
            "all": all_values
        })

    def tune(self, scanner_id, value):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "tune",
            "value": value
        })