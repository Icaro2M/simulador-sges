from dataclasses import replace
from random import Random
from typing import Any

from sges.simulation.scenario import Scenario
from sges.simulation.simulator import SGESSimulator


def _set_nested_attr(obj: Any, path: list[str], value: Any):
    if len(path) == 1:
        return replace(obj, **{path[0]: value})

    current_attr = getattr(obj, path[0])
    updated = _set_nested_attr(current_attr, path[1:], value)
    return replace(obj, **{path[0]: updated})


def run_monte_carlo(
    base_scenario: Scenario,
    parameter_ranges: dict[str, tuple[float, float]],
    iterations: int,
    seed: int | None = None,
):
    if iterations <= 0:
        raise ValueError("iterations must be greater than zero")

    rng = Random(seed)
    simulator = SGESSimulator()
    rows = []

    for index in range(iterations):
        scenario = base_scenario
        sampled_values = {}

        for parameter_path, bounds in parameter_ranges.items():
            min_val, max_val = bounds
            value = rng.uniform(min_val, max_val)
            scenario = _set_nested_attr(scenario, parameter_path.split("."), value)
            sampled_values[parameter_path] = value

        result = simulator.run(scenario)

        rows.append(
            {
                "iteration": index + 1,
                "sampled_values": sampled_values,
                "lcos": (
                    result.lcos_result.lcos_per_mwh
                    if result.lcos_result is not None
                    else None
                ),
                "capex": result.initial_capex,
                "annual_energy_mwh": result.annual_discharged_energy_mwh,
                "round_trip_efficiency": result.technology_result.round_trip_efficiency,
            }
        )

    return rows
