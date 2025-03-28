from fastapi import WebSocket
import json

class WebsocketManager:
    def __init__(self):
        self._clients: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self._clients.append(websocket)

    def disconnect(self, websocket):
        self._clients.remove(websocket)

    async def send_message(self, message):
        payload = json.dumps(message)
        for client in self._clients:
            try:
                await client.send_text(payload)
            except Exception as e:
                print(f"Error sending message to client: {e}")