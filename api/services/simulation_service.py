from dataclasses import asdict

from api.schemas.scenario import SimulationRequest
from api.services.scenario_service import ScenarioService
from sges.simulation.simulator import SGESSimulator


class SimulationService:
    def __init__(self):
        self.scenario_service = ScenarioService()

    def run_simulation(self, request: SimulationRequest) -> dict:
        scenario = self.scenario_service.build_scenario(request)

        simulator = SGESSimulator()
        result = simulator.run(scenario)

        return asdict(result)

    def run_comparison(self, scenarios: list[SimulationRequest]) -> list[dict]:
        results = []

        for scenario_request in scenarios:
            result = self.run_simulation(scenario_request)

            technology_result = result["technology_result"]

            results.append({
                "scenario_name": scenario_request.name,
                "technology_name": scenario_request.technology_type,

                "stored_energy_kwh": technology_result["stored_energy_kwh"],
                "required_charge_energy_kwh": technology_result[
                    "required_charge_energy_kwh"
                ],
                "delivered_energy_kwh": technology_result["delivered_energy_kwh"],
                "charge_efficiency": technology_result["charge_efficiency"],
                "discharge_efficiency": technology_result["discharge_efficiency"],
                "round_trip_efficiency": technology_result["round_trip_efficiency"],
                "nominal_power_kw": technology_result["nominal_power_kw"],

                "initial_capex": result["initial_capex"],
                "annual_opex": result["annual_opex"],
                "annual_discharged_energy_mwh": result[
                    "annual_discharged_energy_mwh"
                ],
                "lcos_per_mwh": (
                    result["lcos_result"]["lcos_per_mwh"]
                    if result["lcos_result"] is not None
                    else None
                ),
            })

        return results
