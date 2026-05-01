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
    nominal_power_kw: float
    motor_efficiency: float
    generator_efficiency: float
    mechanical_efficiency: float
    auxiliary_efficiency: float = 1.0
    loss_model: LossModel = LossModel()

    def simulate(self) -> TechnologyResult:
        if self.nominal_power_kw <= 0:
            raise InvalidParameterError("nominal_power_kw must be greater than zero")

        energy = calculate_potential_energy(
            PotentialEnergyInput(
                mass_kg=self.mass_kg,
                height_m=self.height_m,
            )
        )

        round_trip_efficiency = calculate_round_trip_efficiency(
            EfficiencyChain(
                motor_efficiency=self.motor_efficiency,
                generator_efficiency=self.generator_efficiency,
                mechanical_efficiency=self.mechanical_efficiency,
                auxiliary_efficiency=self.auxiliary_efficiency,
            )
        )

        delivered_energy_kwh = energy.energy_kwh * round_trip_efficiency
        delivered_energy_kwh = self.loss_model.apply_cycle_losses(delivered_energy_kwh)

        effective_round_trip_efficiency = delivered_energy_kwh / energy.energy_kwh

        charge_time_h = energy.energy_kwh / self.nominal_power_kw
        discharge_time_h = delivered_energy_kwh / self.nominal_power_kw

        return TechnologyResult(
            technology_name="Tower SGES",
            stored_energy_kwh=energy.energy_kwh,
            delivered_energy_kwh=delivered_energy_kwh,
            round_trip_efficiency=effective_round_trip_efficiency,
            nominal_power_kw=self.nominal_power_kw,
            charge_time_h=charge_time_h,
            discharge_time_h=discharge_time_h,
        )