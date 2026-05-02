import pandas as pd

from api.schemas.dispatch import DispatchRequest
from api.services.scenario_service import ScenarioService
from sges.simulation.dispatcher import (
    DispatchConfig,
    run_price_arbitrage_dispatch,
)
from sges.physics.loss_model import LossModel
from sges.simulation.simulator import SGESSimulator


class DispatchService:
    def __init__(self):
        self.scenario_service = ScenarioService()

    def run_dispatch(self, request: DispatchRequest) -> list[dict]:
        scenario = self.scenario_service.build_scenario(request.scenario)

        simulator = SGESSimulator()
        simulation_result = simulator.run(scenario)

        price_profile = pd.DataFrame(
            [point.model_dump() for point in request.price_profile]
        )

        dispatch_result = run_price_arbitrage_dispatch(
            simulation_result=simulation_result,
            price_profile=price_profile,
            config=DispatchConfig(
                low_price_threshold=request.low_price_threshold,
                high_price_threshold=request.high_price_threshold,
                initial_soc_kwh=request.initial_soc_kwh,
                loss_model=LossModel(
                    cycle_loss_fraction=scenario.losses.cycle_loss_fraction,
                    fixed_cycle_loss_kwh=scenario.losses.fixed_cycle_loss_kwh,
                    standby_loss_kwh_per_hour=scenario.losses.standby_loss_kwh_per_hour,
                ),
            ),
        )

        return dispatch_result.to_dict(orient="records")
