from services.message_bus import MessageBus
from services.scanner_config import ScannerConfig

class ScannerController:
    def __init__(self, message_bus: MessageBus, scanner_config: ScannerConfig):
        self._message_bus = message_bus
        self._scanner_config = scanner_config

    def list(self):
        return self._scanner_config.get_scanners()

    def scan(self, scanner_id, tuner_idx):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "scan",
            "tuner_idx": tuner_idx
        })

    def next(self, scanner_id, tuner_idx):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "next",
            "tuner_idx": tuner_idx
        })

    def prev(self, scanner_id, tuner_idx):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "prev",
            "tuner_idx": tuner_idx
        })

    def set(self, scanner_id, tuner_idx, value):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "set",
            "tuner_idx": tuner_idx,
            "value": value
        })

    def stop(self, scanner_id, tuner_idx):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "stop",
            "tuner_idx": tuner_idx
        })

    def skip(self, scanner_id, tuner_idx):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "skip",
            "tuner_idx": tuner_idx
        })

    def clear_skip(self, scanner_id, tuner_idx, value, all_values):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "clear_skip",
            "tuner_idx": tuner_idx,
            "value": value,
            "all": all_values
        })

    def tune(self, scanner_id, tuner_idx, value):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "tune",
            "tuner_idx": tuner_idx,
            "value": value
        })