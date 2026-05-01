from pathlib import Path

from sges.io.config_loader import load_scenario_from_yaml
from sges.simulation.results import SimulationResult
from sges.simulation.simulator import SGESSimulator


def run_batch(config_dir: str | Path) -> list[SimulationResult]:
    directory = Path(config_dir)

    if not directory.exists():
        raise FileNotFoundError(f"config directory not found: {directory}")

    if not directory.is_dir():
        raise NotADirectoryError(f"path is not a directory: {directory}")

    simulator = SGESSimulator()
    results = []

    for config_path in sorted(directory.glob("*.yaml")):
        try:
            scenario = load_scenario_from_yaml(config_path)
            results.append(simulator.run(scenario))
        except Exception as e:
            print(f"Skipping {config_path}: {e}")

    return results