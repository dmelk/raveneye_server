import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
from service_container import service_container
from routes import scanners, logs

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    await service_container.setup_services()

    yield
    # Shutdown tasks
    await service_container.close_services()

app = FastAPI(root_path="/api", lifespan=lifespan)

app.include_router(scanners.router)
app.include_router(logs.router)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    websocket_manager = service_container.websocket_manager()
    await websocket_manager.connect(websocket)
    try:
        while True:
            json_text = await websocket.receive_text()
            data = json.loads(json_text)
            if data.get("action") == "subscribe" and "topic" in data:
                topic = data["topic"]
                websocket_manager.subscribe(websocket, topic)
            elif data.get("action") == "unsubscribe" and "topic" in data:
                topic = data["topic"]
                websocket_manager.unsubscribe(websocket, topic)
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
