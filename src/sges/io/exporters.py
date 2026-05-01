from pathlib import Path
import json
import csv

from sges.simulation.results import SimulationResult


def simulation_result_to_dict(result: SimulationResult) -> dict:
    return {
        "scenario_name": result.scenario_name,
        "technology": {
            "name": result.technology_result.technology_name,
            "stored_energy_kwh": result.technology_result.stored_energy_kwh,
            "delivered_energy_kwh": result.technology_result.delivered_energy_kwh,
            "round_trip_efficiency": result.technology_result.round_trip_efficiency,
            "nominal_power_kw": result.technology_result.nominal_power_kw,
            "charge_time_h": result.technology_result.charge_time_h,
            "discharge_time_h": result.technology_result.discharge_time_h,
        },
        "economics": {
            "initial_capex": result.initial_capex,
            "annual_opex": result.annual_opex,
            "annual_discharged_energy_mwh": result.annual_discharged_energy_mwh,
            "lcos_per_mwh": result.lcos_result.lcos_per_mwh,
            "discounted_cost": result.lcos_result.discounted_cost,
            "discounted_energy_mwh": result.lcos_result.discounted_energy_mwh,
        },
    }


def export_result_to_json(result: SimulationResult, path: str | Path) -> None:
    output_path = Path(path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8") as file:
        json.dump(simulation_result_to_dict(result), file, indent=4)


def export_result_to_csv(result: SimulationResult, path: str | Path) -> None:
    output_path = Path(path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    data = simulation_result_to_dict(result)

    rows = [
        ("scenario_name", data["scenario_name"]),
        ("technology_name", data["technology"]["name"]),
        ("stored_energy_kwh", data["technology"]["stored_energy_kwh"]),
        ("delivered_energy_kwh", data["technology"]["delivered_energy_kwh"]),
        ("round_trip_efficiency", data["technology"]["round_trip_efficiency"]),
        ("nominal_power_kw", data["technology"]["nominal_power_kw"]),
        ("charge_time_h", data["technology"]["charge_time_h"]),
        ("discharge_time_h", data["technology"]["discharge_time_h"]),
        ("initial_capex", data["economics"]["initial_capex"]),
        ("annual_opex", data["economics"]["annual_opex"]),
        ("annual_discharged_energy_mwh", data["economics"]["annual_discharged_energy_mwh"]),
        ("lcos_per_mwh", data["economics"]["lcos_per_mwh"]),
        ("discounted_cost", data["economics"]["discounted_cost"]),
        ("discounted_energy_mwh", data["economics"]["discounted_energy_mwh"]),
    ]

    with output_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["metric", "value"])
        writer.writerows(rows)