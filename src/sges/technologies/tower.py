from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError
from sges.physics.efficiency_model import EfficiencyChain, calculate_round_trip_efficiency
from sges.physics.energy_model import PotentialEnergyInput, calculate_potential_energy
from sges.physics.loss_model import LossModel
from sges.technologies.base import GravityStorageTechnology, TechnologyResult


@dataclass(frozen=True)
class TowerSGES(GravityStorageTechnology):
    mass_kg: float
    height_m: float
    charge_efficiency: float
    discharge_efficiency: float
    nominal_power_kw: float | None = None
    charge_power_kw: float | None = None
    discharge_power_kw: float | None = None
    loss_model: LossModel = LossModel()

    def simulate(self) -> TechnologyResult:
        charge_power_kw, discharge_power_kw = self._resolve_power_limits()
        nominal_power_kw = max(charge_power_kw, discharge_power_kw)

        energy = calculate_potential_energy(
            PotentialEnergyInput(
                mass_kg=self.mass_kg,
                height_m=self.height_m,
            )
        )

        technical_round_trip_efficiency = calculate_round_trip_efficiency(
            EfficiencyChain(
                charge_efficiency=self.charge_efficiency,
                discharge_efficiency=self.discharge_efficiency,
            )
        )

        input_energy_kwh = energy.energy_kwh / self.charge_efficiency
        technical_delivered_energy_kwh = energy.energy_kwh * self.discharge_efficiency

        charge_time_h = input_energy_kwh / charge_power_kw
        discharge_time_h = technical_delivered_energy_kwh / discharge_power_kw

        return TechnologyResult(
            technology_name="Tower SGES",
            max_potential_energy_kwh=energy.energy_kwh,
            input_energy_kwh=input_energy_kwh,
            stored_energy_kwh=energy.energy_kwh,
            required_charge_energy_kwh=input_energy_kwh,
            technical_delivered_energy_kwh=technical_delivered_energy_kwh,
            delivered_energy_kwh=technical_delivered_energy_kwh,
            charge_efficiency=self.charge_efficiency,
            discharge_efficiency=self.discharge_efficiency,
            round_trip_efficiency=technical_round_trip_efficiency,
            nominal_power_kw=nominal_power_kw,
            charge_power_kw=charge_power_kw,
            discharge_power_kw=discharge_power_kw,
            charge_time_h=charge_time_h,
            discharge_time_h=discharge_time_h,
        )

    def _resolve_power_limits(self) -> tuple[float, float]:
        charge_power_kw = self.charge_power_kw or self.nominal_power_kw
        discharge_power_kw = self.discharge_power_kw or self.nominal_power_kw

        if charge_power_kw is None or charge_power_kw <= 0:
            raise InvalidParameterError("charge_power_kw must be greater than zero")

        if discharge_power_kw is None or discharge_power_kw <= 0:
            raise InvalidParameterError("discharge_power_kw must be greater than zero")

        return charge_power_kw, discharge_power_kw
