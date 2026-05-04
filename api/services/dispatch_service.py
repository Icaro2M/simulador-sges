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

    def run_dispatch(self, request: DispatchRequest) -> dict:
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
        technology_result = simulation_result.technology_result
        summary = dispatch_result.attrs.get("summary", {})
        summary.update(
            {
                "technology_name": technology_result.technology_name,
                "storage_capacity_kwh": technology_result.stored_energy_kwh,
                "max_potential_energy_kwh": (
                    technology_result.max_potential_energy_kwh
                ),
                "effective_mass_kg": technology_result.effective_mass_kg,
                "usable_height_m": technology_result.usable_height_m,
                "usable_depth_m": technology_result.usable_depth_m,
                "base_capex": simulation_result.base_capex,
                "technology_specific_capex": (
                    simulation_result.technology_specific_capex
                ),
                "tower_structure_cost": simulation_result.tower_structure_cost,
                "shaft_rehabilitation_cost": (
                    simulation_result.shaft_rehabilitation_cost
                ),
                "initial_capex": simulation_result.initial_capex,
            }
        )

        return {
            "results": dispatch_result.to_dict(orient="records"),
            "summary": summary,
        }
