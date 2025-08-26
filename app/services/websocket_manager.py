from fastapi import WebSocket
import json

class WebsocketManager:
    def __init__(self):
        self._topic_subscriptions: dict[str, list[WebSocket]] = {}
        self._clients: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self._clients.append(websocket)

    def disconnect(self, websocket):
        self._clients.remove(websocket)

    def subscribe(self, websocket: WebSocket, topic: str):
        self._topic_subscriptions.setdefault(topic, [])
        if websocket not in self._topic_subscriptions[topic]:
            self._topic_subscriptions[topic].append(websocket)

    def unsubscribe(self, websocket: WebSocket, topic: str):
        if topic in self._topic_subscriptions:
            if websocket in self._topic_subscriptions[topic]:
                self._topic_subscriptions[topic].remove(websocket)
                if not self._topic_subscriptions[topic]:
                    del self._topic_subscriptions[topic]

    async def send_message(self, message, topic):
        payload = json.dumps(message)
        if topic in self._topic_subscriptions:
            for client in self._topic_subscriptions[topic]:
                try:
                    await client.send_text(payload)
                except Exception as e:
                    print(f"Error sending message to client: {e}")