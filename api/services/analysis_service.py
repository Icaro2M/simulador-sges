from api.schemas.scenario import SimulationRequest
from api.services.scenario_service import ScenarioService
from sges.analysis.monte_carlo import run_monte_carlo
from sges.analysis.sensitivity import run_sensitivity


class AnalysisService:
    def __init__(self):
        self.scenario_service = ScenarioService()

    def run_sensitivity_analysis(
        self,
        base_scenario_request: SimulationRequest,
        parameter_path: str,
        min_val: float,
        max_val: float,
        steps: int,
    ) -> list[dict]:
        base_scenario = self.scenario_service.build_scenario(base_scenario_request)

        return run_sensitivity(
            base_scenario=base_scenario,
            parameter_path=parameter_path,
            min_val=min_val,
            max_val=max_val,
            steps=steps,
        )

    def run_monte_carlo_analysis(
        self,
        base_scenario_request: SimulationRequest,
        parameter_ranges: dict[str, tuple[float, float]],
        iterations: int,
        seed: int | None = None,
    ) -> list[dict]:
        base_scenario = self.scenario_service.build_scenario(base_scenario_request)

        return run_monte_carlo(
            base_scenario=base_scenario,
            parameter_ranges=parameter_ranges,
            iterations=iterations,
            seed=seed,
        )