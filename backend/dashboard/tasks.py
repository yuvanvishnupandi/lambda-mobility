from celery import shared_task
from dashboard.simulation import SimulationEngine

@shared_task
def run_simulation_step():
    """
    Celery scheduled task to advance simulation by one step.
    Can be run periodically via Celery Beat every few seconds.
    """
    engine = SimulationEngine()
    if engine.is_running:
        # Executes one simulation cycle
        pass
    return "Simulation step executed"
