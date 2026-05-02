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
        loss_model = self._build_loss_model(scenario)

        standby_hours_per_cycle = self._calculate_standby_hours_per_cycle(
            cycles_per_year=scenario.economics.cycles_per_year,
            charge_time_h=technology_result.charge_time_h,
            discharge_time_h=technology_result.discharge_time_h,
        )
        standby_loss_per_cycle_kwh = min(
            loss_model.calculate_standby_loss(hours=standby_hours_per_cycle),
            technology_result.stored_energy_kwh,
        )
        effective_stored_energy_kwh = (
            technology_result.stored_energy_kwh - standby_loss_per_cycle_kwh
        )
        effective_delivered_energy_kwh = loss_model.apply_cycle_losses(
            effective_stored_energy_kwh * technology_result.discharge_efficiency
        )
        annual_standby_loss_kwh = (
            standby_loss_per_cycle_kwh * scenario.economics.cycles_per_year
        )

        annual_discharged_energy_mwh = (
            effective_delivered_energy_kwh
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

        status = "ok"
        warnings = []
        lcos_result = None

        if annual_discharged_energy_mwh > 0:
            lcos_result = calculate_lcos(
                LcosInput(
                    initial_capex=initial_capex,
                    annual_opex=annual_opex,
                    annual_discharged_energy_mwh=annual_discharged_energy_mwh,
                    project_lifetime_years=scenario.economics.project_lifetime_years,
                    discount_rate=scenario.economics.discount_rate,
                )
            )
        else:
            status = "no_deliverable_energy"
            warnings.append(
                "As perdas configuradas deixam a energia anual entregavel igual a zero; "
                "o LCOS fica indefinido. "
                f"Energia armazenada: {technology_result.stored_energy_kwh:.4f} kWh; "
                f"energia tecnica entregue: {technology_result.delivered_energy_kwh:.4f} kWh; "
                f"tempo medio em standby por ciclo: {standby_hours_per_cycle:.4f} h; "
                f"perda em standby por ciclo: {standby_loss_per_cycle_kwh:.4f} kWh."
            )

        return SimulationResult(
            scenario_name=scenario.name,
            technology_result=technology_result,
            effective_delivered_energy_kwh=effective_delivered_energy_kwh,
            standby_hours_per_cycle=standby_hours_per_cycle,
            standby_loss_per_cycle_kwh=standby_loss_per_cycle_kwh,
            annual_standby_loss_kwh=annual_standby_loss_kwh,
            status=status,
            warnings=warnings,
            initial_capex=initial_capex,
            annual_opex=annual_opex,
            annual_discharged_energy_mwh=annual_discharged_energy_mwh,
            lcos_result=lcos_result,
        )

    def _build_loss_model(self, scenario: Scenario) -> LossModel:
        return LossModel(
            cycle_loss_fraction=scenario.losses.cycle_loss_fraction,
            fixed_cycle_loss_kwh=scenario.losses.fixed_cycle_loss_kwh,
            standby_loss_kwh_per_hour=scenario.losses.standby_loss_kwh_per_hour,
        )

    def _build_technology(self, scenario: Scenario):
        technology = scenario.technology
        loss_model = self._build_loss_model(scenario)

        if technology.type == "tower":
            return TowerSGES(
                mass_kg=technology.mass_kg,
                height_m=technology.height_m,
                nominal_power_kw=technology.nominal_power_kw,
                charge_efficiency=technology.charge_efficiency,
                discharge_efficiency=technology.discharge_efficiency,
                loss_model=loss_model,
            )

        if technology.type == "shaft":
            return ShaftSGES(
                mass_kg=technology.mass_kg,
                depth_m=technology.height_m,
                nominal_power_kw=technology.nominal_power_kw,
                charge_efficiency=technology.charge_efficiency,
                discharge_efficiency=technology.discharge_efficiency,
                loss_model=loss_model,
            )

        raise InvalidParameterError(f"unsupported technology type: {technology.type}")

    def _calculate_standby_hours_per_cycle(
        self,
        cycles_per_year: int,
        charge_time_h: float,
        discharge_time_h: float,
    ) -> float:
        cycle_period_h = 8760 / cycles_per_year
        active_cycle_time_h = charge_time_h + discharge_time_h

        return max(cycle_period_h - active_cycle_time_h, 0.0)
