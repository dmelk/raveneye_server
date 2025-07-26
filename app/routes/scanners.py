from fastapi import APIRouter
from service_container import service_container
from pydantic import BaseModel

class ClearSkipModel(BaseModel):
    value: int
    all_values: str

class TuneModel(BaseModel):
    value: int

class FrequencyModel(BaseModel):
    value: int

class RenameModel(BaseModel):
    name: str

router = APIRouter(prefix="/scanners", tags=["Scanners"])

@router.get("/")
async def list():
    return await service_container.scanner_controller().list()

@router.post("/{scanner_id}/rename")
async def scan(scanner_id: str, model: RenameModel):
    await service_container.scanner_controller().rename(scanner_id, model.name)
    return {"status": "OK"}

@router.post("/{scanner_id}/scan")
def scan(scanner_id: str):
    service_container.scanner_controller().scan(scanner_id)
    return {"status": "OK"}

@router.post("/{scanner_id}/next")
def next(scanner_id: str):
    service_container.scanner_controller().next(scanner_id)
    return {"status": "OK"}

@router.post("/{scanner_id}/prev")
def prev(scanner_id: str):
    service_container.scanner_controller().prev(scanner_id)
    return {"status": "OK"}

@router.post("/{scanner_id}/stop")
def stop(scanner_id: str):
    service_container.scanner_controller().stop(scanner_id)
    return {"status": "OK"}

@router.post("/{scanner_id}/skip")
def skip(scanner_id: str):
    service_container.scanner_controller().skip(scanner_id)
    return {"status": "OK"}

@router.post("/{scanner_id}/clear_skip")
def clear_skip(scanner_id: str, model: ClearSkipModel):
    service_container.scanner_controller().clear_skip(scanner_id, model.value, model.all_values)
    return {"status": "OK"}

@router.post("/{scanner_id}/tune")
def tune(scanner_id: str, model: TuneModel):
    service_container.scanner_controller().tune(scanner_id, model.value)
    return {"status": "OK"}

@router.post("/{scanner_id}/set_frequency")
def set_frequency(scanner_id: str, model: FrequencyModel):
    service_container.scanner_controller().set(scanner_id, model.value)
    return {"status": "OK"}