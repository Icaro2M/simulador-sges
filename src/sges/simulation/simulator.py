from sges.core.exceptions import InvalidParameterError
from sges.economics.capex import CapexModel
from sges.economics.lcos import LcosInput, calculate_lcos
from sges.economics.opex import OpexModel
from sges.simulation.results import SimulationResult
from sges.simulation.scenario import Scenario
from sges.technologies.shaft import ShaftSGES
from sges.technologies.tower import TowerSGES
from sges.physics.loss_model import LossModel


class SGESSimulator:
    def run(self, scenario: Scenario) -> SimulationResult:
        technology = self._build_technology(scenario)
        technology_result = technology.simulate()

        annual_discharged_energy_mwh = (
            technology_result.delivered_energy_kwh
            * scenario.economics.cycles_per_year
        ) / 1000

        capex_model = CapexModel(
            cost_per_kw=scenario.economics.cost_per_kw,
            cost_per_kwh=scenario.economics.cost_per_kwh,
            fixed_cost=scenario.economics.fixed_capex,
        )

        initial_capex = capex_model.calculate(
            nominal_power_kw=technology_result.nominal_power_kw,
            storage_capacity_kwh=technology_result.stored_energy_kwh,
        )

        opex_model = OpexModel(
            fixed_annual_cost=scenario.economics.fixed_annual_opex,
            variable_cost_per_mwh=scenario.economics.variable_opex_per_mwh,
        )

        annual_opex = opex_model.calculate_annual(
            discharged_energy_mwh_per_year=annual_discharged_energy_mwh,
        )

        lcos_result = calculate_lcos(
            LcosInput(
                initial_capex=initial_capex,
                annual_opex=annual_opex,
                annual_discharged_energy_mwh=annual_discharged_energy_mwh,
                project_lifetime_years=scenario.economics.project_lifetime_years,
                discount_rate=scenario.economics.discount_rate,
            )
        )

        return SimulationResult(
            scenario_name=scenario.name,
            technology_result=technology_result,
            initial_capex=initial_capex,
            annual_opex=annual_opex,
            annual_discharged_energy_mwh=annual_discharged_energy_mwh,
            lcos_result=lcos_result,
        )

    def _build_technology(self, scenario: Scenario):
        technology = scenario.technology

        loss_model = LossModel(
            cycle_loss_fraction=scenario.losses.cycle_loss_fraction,
            fixed_cycle_loss_kwh=scenario.losses.fixed_cycle_loss_kwh,
            standby_loss_kwh_per_hour=scenario.losses.standby_loss_kwh_per_hour,
        )

        if technology.type == "tower":
            return TowerSGES(
                mass_kg=technology.mass_kg,
                height_m=technology.height_m,
                nominal_power_kw=technology.nominal_power_kw,
                motor_efficiency=technology.motor_efficiency,
                generator_efficiency=technology.generator_efficiency,
                mechanical_efficiency=technology.mechanical_efficiency,
                auxiliary_efficiency=technology.auxiliary_efficiency,
                loss_model=loss_model,
            )

        if technology.type == "shaft":
            return ShaftSGES(
                mass_kg=technology.mass_kg,
                depth_m=technology.height_m,
                nominal_power_kw=technology.nominal_power_kw,
                motor_efficiency=technology.motor_efficiency,
                generator_efficiency=technology.generator_efficiency,
                mechanical_efficiency=technology.mechanical_efficiency,
                auxiliary_efficiency=technology.auxiliary_efficiency,
                loss_model=loss_model,
            )

        raise InvalidParameterError(f"unsupported technology type: {technology.type}")