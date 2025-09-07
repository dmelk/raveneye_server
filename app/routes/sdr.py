from fastapi import APIRouter
from service_container import service_container
from pydantic import BaseModel

class IntervalModel(BaseModel):
    start: int
    end: int

class ChangeIntervalModel(IntervalModel):
    interval_id: int

class RemoveIntervalModel(BaseModel):
    interval_id: int

class RenameModel(BaseModel):
    name: str

class ConfigureModel(BaseModel):
    lna: int
    vga: int
    amp: bool
    
router = APIRouter(prefix="/sdr", tags=["SDR"])

@router.get("/")
async def list():
    return await service_container.sdr_controller().list()

@router.post("/{sdr_id}/rename")
async def scan(sdr_id: str, model: RenameModel):
    await service_container.sdr_controller().rename(sdr_id, model.name)
    return {"status": "OK"}

@router.post("/{sdr_id}/start")
def start(sdr_id: str):
    service_container.sdr_controller().start(sdr_id)
    return {"status": "OK"}

@router.post("/{sdr_id}/stop")
def stop(sdr_id: str):
    service_container.sdr_controller().stop(sdr_id)
    return {"status": "OK"}

@router.post("/{sdr_id}/add_interval")
def add_interval(sdr_id: str, model: IntervalModel):
    service_container.sdr_controller().add_interval(sdr_id, model.start, model.end)
    return {"status": "OK"}

@router.post("/{sdr_id}/change_interval")
def change_interval(sdr_id: str, model: ChangeIntervalModel):
    service_container.sdr_controller().change_interval(sdr_id, model.interval_id, model.start, model.end)
    return {"status": "OK"}

@router.post("/{sdr_id}/remove_interval")
def remove_interval(sdr_id: str, model: RemoveIntervalModel):
    service_container.sdr_controller().remove_interval(sdr_id, model.interval_id)
    return {"status": "OK"}

@router.post("/{sdr_id}/clear_intervals")
def clear_intervals(sdr_id: str):
    service_container.sdr_controller().clear_intervals(sdr_id)
    return {"status": "OK"}

@router.post("/{sdr_id}/configure")
def configure(sdr_id: str, model: ConfigureModel):
    service_container.sdr_controller().configure(sdr_id, model.lna, model.vga, model.amp)
    return {"status": "OK"}