import json

class ScannerConfig:
    _config = None

    def __init__(self, config_path):
        with open(config_path, "r") as file:
            self._config = json.load(file)
            file.close()

    def get_scanners(self):
        return self._config