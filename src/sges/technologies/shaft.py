from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError
from sges.physics.efficiency_model import EfficiencyChain, calculate_round_trip_efficiency
from sges.physics.energy_model import PotentialEnergyInput, calculate_potential_energy
from sges.technologies.base import GravityStorageTechnology, TechnologyResult


@dataclass(frozen=True)
class ShaftSGES(GravityStorageTechnology):
    mass_kg: float
    depth_m: float
    charge_efficiency: float
    discharge_efficiency: float
    nominal_power_kw: float | None = None
    charge_power_kw: float | None = None
    discharge_power_kw: float | None = None
    usable_depth_fraction: float = 1.0
    shaft_rehabilitation_cost: float = 0.0
    material_density_kg_m3: float | None = None
    container_volume_m3: float | None = None

    def simulate(self) -> TechnologyResult:
        charge_power_kw, discharge_power_kw = self._resolve_power_limits()
        nominal_power_kw = max(charge_power_kw, discharge_power_kw)
        effective_mass_kg = self._resolve_effective_mass()
        usable_depth_m = self._resolve_usable_depth()
        shaft_rehabilitation_cost = self._resolve_rehabilitation_cost()

        energy = calculate_potential_energy(
            PotentialEnergyInput(
                mass_kg=effective_mass_kg,
                height_m=usable_depth_m,
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
            technology_name="Shaft SGES",
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
            effective_mass_kg=effective_mass_kg,
            usable_depth_m=usable_depth_m,
            shaft_rehabilitation_cost=shaft_rehabilitation_cost,
            technology_specific_capex=shaft_rehabilitation_cost,
        )

    def _resolve_power_limits(self) -> tuple[float, float]:
        charge_power_kw = self.charge_power_kw or self.nominal_power_kw
        discharge_power_kw = self.discharge_power_kw or self.nominal_power_kw

        if charge_power_kw is None or charge_power_kw <= 0:
            raise InvalidParameterError("charge_power_kw must be greater than zero")

        if discharge_power_kw is None or discharge_power_kw <= 0:
            raise InvalidParameterError("discharge_power_kw must be greater than zero")

        return charge_power_kw, discharge_power_kw

    def _resolve_effective_mass(self) -> float:
        has_density = self.material_density_kg_m3 is not None
        has_volume = self.container_volume_m3 is not None

        if has_density != has_volume:
            raise InvalidParameterError(
                "material_density_kg_m3 and container_volume_m3 must be provided together"
            )

        if has_density and has_volume:
            if self.material_density_kg_m3 is None or self.material_density_kg_m3 <= 0:
                raise InvalidParameterError(
                    "material_density_kg_m3 must be greater than zero"
                )

            if self.container_volume_m3 is None or self.container_volume_m3 <= 0:
                raise InvalidParameterError(
                    "container_volume_m3 must be greater than zero"
                )

            return self.material_density_kg_m3 * self.container_volume_m3

        return self.mass_kg

    def _resolve_usable_depth(self) -> float:
        if not 0 < self.usable_depth_fraction <= 1:
            raise InvalidParameterError(
                "usable_depth_fraction must be greater than zero and less than or equal to one"
            )

        return self.depth_m * self.usable_depth_fraction

    def _resolve_rehabilitation_cost(self) -> float:
        if self.shaft_rehabilitation_cost < 0:
            raise InvalidParameterError(
                "shaft_rehabilitation_cost must be greater than or equal to zero"
            )

        return self.shaft_rehabilitation_cost
