from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError
from sges.physics.efficiency_model import EfficiencyChain, calculate_round_trip_efficiency
from sges.physics.energy_model import PotentialEnergyInput, calculate_potential_energy
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
    block_count: int | None = None
    mass_per_block_kg: float | None = None
    usable_height_fraction: float = 1.0
    structure_cost_per_meter: float = 0.0

    def simulate(self) -> TechnologyResult:
        charge_power_kw, discharge_power_kw = self._resolve_power_limits()
        nominal_power_kw = max(charge_power_kw, discharge_power_kw)
        effective_mass_kg = self._resolve_effective_mass()
        usable_height_m = self._resolve_usable_height()
        tower_structure_cost = self._calculate_structure_cost()

        energy = calculate_potential_energy(
            PotentialEnergyInput(
                mass_kg=effective_mass_kg,
                height_m=usable_height_m,
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
            effective_mass_kg=effective_mass_kg,
            usable_height_m=usable_height_m,
            tower_structure_cost=tower_structure_cost,
            technology_specific_capex=tower_structure_cost,
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
        has_block_count = self.block_count is not None
        has_mass_per_block = self.mass_per_block_kg is not None

        if has_block_count != has_mass_per_block:
            raise InvalidParameterError(
                "block_count and mass_per_block_kg must be provided together"
            )

        if has_block_count and has_mass_per_block:
            if self.block_count is None or self.block_count <= 0:
                raise InvalidParameterError("block_count must be greater than zero")

            if self.mass_per_block_kg is None or self.mass_per_block_kg <= 0:
                raise InvalidParameterError(
                    "mass_per_block_kg must be greater than zero"
                )

            return self.block_count * self.mass_per_block_kg

        return self.mass_kg

    def _resolve_usable_height(self) -> float:
        if not 0 < self.usable_height_fraction <= 1:
            raise InvalidParameterError(
                "usable_height_fraction must be greater than zero and less than or equal to one"
            )

        return self.height_m * self.usable_height_fraction

    def _calculate_structure_cost(self) -> float:
        if self.structure_cost_per_meter < 0:
            raise InvalidParameterError(
                "structure_cost_per_meter must be greater than or equal to zero"
            )

        return self.structure_cost_per_meter * self.height_m
