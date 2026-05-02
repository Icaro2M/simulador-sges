from dataclasses import dataclass

from sges.simulation.results import SimulationResult


@dataclass(frozen=True)
class ComparisonRow:
    scenario_name: str
    technology_name: str
    stored_energy_kwh: float
    required_charge_energy_kwh: float
    delivered_energy_kwh: float
    charge_efficiency: float
    discharge_efficiency: float
    round_trip_efficiency: float
    nominal_power_kw: float
    initial_capex: float
    annual_opex: float
    annual_discharged_energy_mwh: float
    lcos_per_mwh: float | None


def build_comparison_table(results: list[SimulationResult]) -> list[ComparisonRow]:
    rows = []

    for result in results:
        rows.append(
            ComparisonRow(
                scenario_name=result.scenario_name,
                technology_name=result.technology_result.technology_name,
                stored_energy_kwh=result.technology_result.stored_energy_kwh,
                required_charge_energy_kwh=(
                    result.technology_result.required_charge_energy_kwh
                ),
                delivered_energy_kwh=result.technology_result.delivered_energy_kwh,
                charge_efficiency=result.technology_result.charge_efficiency,
                discharge_efficiency=result.technology_result.discharge_efficiency,
                round_trip_efficiency=result.technology_result.round_trip_efficiency,
                nominal_power_kw=result.technology_result.nominal_power_kw,
                initial_capex=result.initial_capex,
                annual_opex=result.annual_opex,
                annual_discharged_energy_mwh=result.annual_discharged_energy_mwh,
                lcos_per_mwh=(
                    result.lcos_result.lcos_per_mwh
                    if result.lcos_result is not None
                    else None
                ),
            )
        )

    return sorted(
        rows,
        key=lambda row: (
            row.lcos_per_mwh is None,
            row.lcos_per_mwh if row.lcos_per_mwh is not None else float("inf"),
        ),
    )
