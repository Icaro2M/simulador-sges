from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError
from sges.physics.efficiency_model import EfficiencyChain, calculate_round_trip_efficiency
from sges.physics.energy_model import PotentialEnergyInput, calculate_potential_energy
from sges.physics.loss_model import LossModel
from sges.technologies.base import GravityStorageTechnology, TechnologyResult


@dataclass(frozen=True)
class ShaftSGES(GravityStorageTechnology):
    mass_kg: float
    depth_m: float
    nominal_power_kw: float
    charge_efficiency: float
    discharge_efficiency: float
    loss_model: LossModel = LossModel()

    def simulate(self) -> TechnologyResult:
        if self.nominal_power_kw <= 0:
            raise InvalidParameterError("nominal_power_kw must be greater than zero")

        energy = calculate_potential_energy(
            PotentialEnergyInput(
                mass_kg=self.mass_kg,
                height_m=self.depth_m,
            )
        )

        round_trip_efficiency = calculate_round_trip_efficiency(
            EfficiencyChain(
                charge_efficiency=self.charge_efficiency,
                discharge_efficiency=self.discharge_efficiency,
            )
        )

        required_charge_energy_kwh = energy.energy_kwh / self.charge_efficiency
        delivered_energy_kwh = energy.energy_kwh * self.discharge_efficiency
        delivered_energy_kwh = self.loss_model.apply_cycle_losses(delivered_energy_kwh)

        effective_round_trip_efficiency = (
            delivered_energy_kwh / required_charge_energy_kwh
        )

        charge_time_h = required_charge_energy_kwh / self.nominal_power_kw
        discharge_time_h = delivered_energy_kwh / self.nominal_power_kw

        return TechnologyResult(
            technology_name="Shaft SGES",
            stored_energy_kwh=energy.energy_kwh,
            required_charge_energy_kwh=required_charge_energy_kwh,
            delivered_energy_kwh=delivered_energy_kwh,
            charge_efficiency=self.charge_efficiency,
            discharge_efficiency=self.discharge_efficiency,
            round_trip_efficiency=effective_round_trip_efficiency,
            nominal_power_kw=self.nominal_power_kw,
            charge_time_h=charge_time_h,
            discharge_time_h=discharge_time_h,
        )
