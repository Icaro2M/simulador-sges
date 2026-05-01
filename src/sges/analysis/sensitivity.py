from dataclasses import replace
from typing import Any

from sges.simulation.simulator import SGESSimulator
from sges.simulation.scenario import Scenario


def _set_nested_attr(obj: Any, path: list[str], value: Any):
    if len(path) == 1:
        return replace(obj, **{path[0]: value})

    current_attr = getattr(obj, path[0])
    updated = _set_nested_attr(current_attr, path[1:], value)
    return replace(obj, **{path[0]: updated})


def generate_range(min_val: float, max_val: float, steps: int) -> list[float]:
    if steps < 2:
        return [min_val]

    step_size = (max_val - min_val) / (steps - 1)
    return [min_val + i * step_size for i in range(steps)]


def run_sensitivity(
    base_scenario: Scenario,
    parameter_path: str,
    min_val: float,
    max_val: float,
    steps: int,
):
    simulator = SGESSimulator()

    path_parts = parameter_path.split(".")
    values = generate_range(min_val, max_val, steps)

    results = []

    for value in values:
        scenario = _set_nested_attr(base_scenario, path_parts, value)
        result = simulator.run(scenario)

        results.append(
            {
                "parameter": parameter_path,
                "value": value,
                "lcos": result.lcos_result.lcos_per_mwh,
                "capex": result.initial_capex,
                "annual_energy_mwh": result.annual_discharged_energy_mwh,
            }
        )

    return results