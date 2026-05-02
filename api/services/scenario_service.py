from api.schemas.scenario import SimulationRequest
from sges.simulation.scenario import (
    EconomicScenario,
    LossScenario,
    Scenario,
    TechnologyScenario,
)


class ScenarioService:
    def build_scenario(self, request: SimulationRequest) -> Scenario:
        return Scenario(
            name=request.name,
            technology=TechnologyScenario(
                type=request.technology_type,
                mass_kg=request.mass_kg,
                height_m=request.height_m,
                charge_efficiency=request.charge_efficiency,
                discharge_efficiency=request.discharge_efficiency,
                nominal_power_kw=request.nominal_power_kw,
                charge_power_kw=request.charge_power_kw,
                discharge_power_kw=request.discharge_power_kw,
            ),
            losses=LossScenario(
                cycle_loss_fraction=request.cycle_loss_fraction,
                fixed_cycle_loss_kwh=request.fixed_cycle_loss_kwh,
                standby_loss_kwh_per_hour=request.standby_loss_kwh_per_hour,
            ),
            economics=EconomicScenario(
                cost_per_kw=request.cost_per_kw,
                cost_per_kwh=request.cost_per_kwh,
                fixed_capex=request.fixed_capex,
                fixed_annual_opex=request.fixed_annual_opex,
                variable_opex_per_mwh=request.variable_opex_per_mwh,
                charging_energy_cost_per_mwh=request.charging_energy_cost_per_mwh,
                project_lifetime_years=request.project_lifetime_years,
                discount_rate=request.discount_rate,
                cycles_per_year=request.cycles_per_year,
            ),
        )
