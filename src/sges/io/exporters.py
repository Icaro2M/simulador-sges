from pathlib import Path
import json
import csv

from sges.simulation.results import SimulationResult


def simulation_result_to_dict(result: SimulationResult) -> dict:
    return {
        "scenario_name": result.scenario_name,
        "status": result.status,
        "warnings": result.warnings,
        "technology": {
            "name": result.technology_result.technology_name,
            "max_potential_energy_kwh": result.technology_result.max_potential_energy_kwh,
            "input_energy_kwh": result.technology_result.input_energy_kwh,
            "stored_energy_kwh": result.technology_result.stored_energy_kwh,
            "required_charge_energy_kwh": result.technology_result.required_charge_energy_kwh,
            "technical_delivered_energy_kwh": result.technology_result.technical_delivered_energy_kwh,
            "delivered_energy_kwh": result.technology_result.delivered_energy_kwh,
            "charge_efficiency": result.technology_result.charge_efficiency,
            "discharge_efficiency": result.technology_result.discharge_efficiency,
            "round_trip_efficiency": result.technology_result.round_trip_efficiency,
            "nominal_power_kw": result.technology_result.nominal_power_kw,
            "charge_power_kw": result.technology_result.charge_power_kw,
            "discharge_power_kw": result.technology_result.discharge_power_kw,
            "charge_time_h": result.technology_result.charge_time_h,
            "discharge_time_h": result.technology_result.discharge_time_h,
        },
        "losses": {
            "available_energy_kwh": result.available_energy_kwh,
            "gross_delivered_energy_kwh": result.gross_delivered_energy_kwh,
            "effective_delivered_energy_kwh": result.effective_delivered_energy_kwh,
            "standby_output_loss_per_cycle_kwh": result.standby_output_loss_per_cycle_kwh,
            "fractional_cycle_loss_per_cycle_kwh": result.fractional_cycle_loss_per_cycle_kwh,
            "fixed_cycle_loss_per_cycle_kwh": result.fixed_cycle_loss_per_cycle_kwh,
            "cycle_loss_per_cycle_kwh": result.cycle_loss_per_cycle_kwh,
            "total_loss_per_cycle_kwh": result.total_loss_per_cycle_kwh,
            "effective_round_trip_efficiency": result.effective_round_trip_efficiency,
            "standby_hours_per_cycle": result.standby_hours_per_cycle,
            "standby_loss_per_cycle_kwh": result.standby_loss_per_cycle_kwh,
            "annual_standby_loss_kwh": result.annual_standby_loss_kwh,
        },
        "economics": {
            "initial_capex": result.initial_capex,
            "availability_factor": result.availability_factor,
            "annual_discharged_energy_before_availability_mwh": (
                result.annual_discharged_energy_before_availability_mwh
            ),
            "replacement_cost": result.replacement_cost,
            "replacement_year": result.replacement_year,
            "end_of_life_cost": result.end_of_life_cost,
            "annual_opex": result.annual_opex,
            "annual_discharged_energy_mwh": result.annual_discharged_energy_mwh,
            "annual_charging_energy_mwh": result.annual_charging_energy_mwh,
            "annual_charging_energy_cost": result.annual_charging_energy_cost,
            "annual_lcos_cost": result.annual_lcos_cost,
            "lcos_per_mwh": (
                result.lcos_result.lcos_per_mwh
                if result.lcos_result is not None
                else None
            ),
            "discounted_cost": (
                result.lcos_result.discounted_cost
                if result.lcos_result is not None
                else None
            ),
            "discounted_energy_mwh": (
                result.lcos_result.discounted_energy_mwh
                if result.lcos_result is not None
                else None
            ),
            "discounted_opex": (
                result.lcos_result.discounted_opex
                if result.lcos_result is not None
                else None
            ),
            "discounted_charging_energy_cost": (
                result.lcos_result.discounted_charging_energy_cost
                if result.lcos_result is not None
                else None
            ),
            "discounted_replacement_cost": (
                result.lcos_result.discounted_replacement_cost
                if result.lcos_result is not None
                else None
            ),
            "discounted_end_of_life_cost": (
                result.lcos_result.discounted_end_of_life_cost
                if result.lcos_result is not None
                else None
            ),
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
        ("status", data["status"]),
        ("warnings", "; ".join(data["warnings"])),
        ("technology_name", data["technology"]["name"]),
        ("max_potential_energy_kwh", data["technology"]["max_potential_energy_kwh"]),
        ("input_energy_kwh", data["technology"]["input_energy_kwh"]),
        ("stored_energy_kwh", data["technology"]["stored_energy_kwh"]),
        ("required_charge_energy_kwh", data["technology"]["required_charge_energy_kwh"]),
        ("technical_delivered_energy_kwh", data["technology"]["technical_delivered_energy_kwh"]),
        ("delivered_energy_kwh", data["technology"]["delivered_energy_kwh"]),
        ("charge_efficiency", data["technology"]["charge_efficiency"]),
        ("discharge_efficiency", data["technology"]["discharge_efficiency"]),
        ("round_trip_efficiency", data["technology"]["round_trip_efficiency"]),
        ("nominal_power_kw", data["technology"]["nominal_power_kw"]),
        ("charge_power_kw", data["technology"]["charge_power_kw"]),
        ("discharge_power_kw", data["technology"]["discharge_power_kw"]),
        ("charge_time_h", data["technology"]["charge_time_h"]),
        ("discharge_time_h", data["technology"]["discharge_time_h"]),
        ("available_energy_kwh", data["losses"]["available_energy_kwh"]),
        ("gross_delivered_energy_kwh", data["losses"]["gross_delivered_energy_kwh"]),
        ("effective_delivered_energy_kwh", data["losses"]["effective_delivered_energy_kwh"]),
        ("standby_output_loss_per_cycle_kwh", data["losses"]["standby_output_loss_per_cycle_kwh"]),
        ("fractional_cycle_loss_per_cycle_kwh", data["losses"]["fractional_cycle_loss_per_cycle_kwh"]),
        ("fixed_cycle_loss_per_cycle_kwh", data["losses"]["fixed_cycle_loss_per_cycle_kwh"]),
        ("cycle_loss_per_cycle_kwh", data["losses"]["cycle_loss_per_cycle_kwh"]),
        ("total_loss_per_cycle_kwh", data["losses"]["total_loss_per_cycle_kwh"]),
        ("effective_round_trip_efficiency", data["losses"]["effective_round_trip_efficiency"]),
        ("standby_hours_per_cycle", data["losses"]["standby_hours_per_cycle"]),
        ("standby_loss_per_cycle_kwh", data["losses"]["standby_loss_per_cycle_kwh"]),
        ("annual_standby_loss_kwh", data["losses"]["annual_standby_loss_kwh"]),
        ("initial_capex", data["economics"]["initial_capex"]),
        ("availability_factor", data["economics"]["availability_factor"]),
        (
            "annual_discharged_energy_before_availability_mwh",
            data["economics"]["annual_discharged_energy_before_availability_mwh"],
        ),
        ("replacement_cost", data["economics"]["replacement_cost"]),
        ("replacement_year", data["economics"]["replacement_year"]),
        ("end_of_life_cost", data["economics"]["end_of_life_cost"]),
        ("annual_opex", data["economics"]["annual_opex"]),
        ("annual_discharged_energy_mwh", data["economics"]["annual_discharged_energy_mwh"]),
        ("annual_charging_energy_mwh", data["economics"]["annual_charging_energy_mwh"]),
        ("annual_charging_energy_cost", data["economics"]["annual_charging_energy_cost"]),
        ("annual_lcos_cost", data["economics"]["annual_lcos_cost"]),
        ("lcos_per_mwh", data["economics"]["lcos_per_mwh"]),
        ("discounted_cost", data["economics"]["discounted_cost"]),
        ("discounted_energy_mwh", data["economics"]["discounted_energy_mwh"]),
        ("discounted_opex", data["economics"]["discounted_opex"]),
        ("discounted_charging_energy_cost", data["economics"]["discounted_charging_energy_cost"]),
        ("discounted_replacement_cost", data["economics"]["discounted_replacement_cost"]),
        ("discounted_end_of_life_cost", data["economics"]["discounted_end_of_life_cost"]),
    ]

    with output_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["metric", "value"])
        writer.writerows(rows)
