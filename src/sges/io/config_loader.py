from pathlib import Path

import yaml
from pydantic import AliasChoices, BaseModel, Field, ValidationError, model_validator

from sges.simulation.scenario import (
    EconomicScenario,
    LossScenario,
    Scenario,
    TechnologyScenario,
)


class TechnologyConfig(BaseModel):
    type: str
    mass_kg: float = Field(gt=0)
    height_m: float = Field(gt=0)
    nominal_power_kw: float | None = Field(default=None, gt=0)
    charge_power_kw: float | None = Field(default=None, gt=0)
    discharge_power_kw: float | None = Field(default=None, gt=0)
    block_count: int | None = Field(default=None, gt=0)
    mass_per_block_kg: float | None = Field(default=None, gt=0)
    usable_height_fraction: float = Field(default=1.0, gt=0, le=1)
    structure_cost_per_meter: float = Field(default=0.0, ge=0)
    usable_depth_fraction: float = Field(default=1.0, gt=0, le=1)
    shaft_rehabilitation_cost: float = Field(default=0.0, ge=0)
    material_density_kg_m3: float | None = Field(default=None, gt=0)
    container_volume_m3: float | None = Field(default=None, gt=0)
    charge_efficiency: float = Field(gt=0, le=1)
    discharge_efficiency: float = Field(gt=0, le=1)

    @model_validator(mode="after")
    def fill_power_limits(self):
        if self.charge_power_kw is None:
            self.charge_power_kw = self.nominal_power_kw

        if self.discharge_power_kw is None:
            self.discharge_power_kw = self.nominal_power_kw

        if self.charge_power_kw is None or self.discharge_power_kw is None:
            raise ValueError(
                "provide nominal_power_kw or both charge_power_kw and discharge_power_kw"
            )

        if self.nominal_power_kw is None:
            self.nominal_power_kw = max(self.charge_power_kw, self.discharge_power_kw)

        if (self.block_count is None) != (self.mass_per_block_kg is None):
            raise ValueError(
                "block_count and mass_per_block_kg must be provided together"
            )

        if (self.material_density_kg_m3 is None) != (
            self.container_volume_m3 is None
        ):
            raise ValueError(
                "material_density_kg_m3 and container_volume_m3 must be provided together"
            )

        return self


class LossConfig(BaseModel):
    additional_cycle_loss_fraction: float = Field(
        default=0.0,
        ge=0,
        lt=1,
        validation_alias=AliasChoices(
            "additional_cycle_loss_fraction",
            "cycle_loss_fraction",
        ),
    )
    fixed_cycle_loss_kwh: float = Field(default=0.0, ge=0)
    standby_loss_stored_kwh_per_hour: float = Field(
        default=0.0,
        ge=0,
        validation_alias=AliasChoices(
            "standby_loss_stored_kwh_per_hour",
            "standby_loss_kwh_per_hour",
        ),
    )


class EconomicsConfig(BaseModel):
    cost_per_kw: float = Field(ge=0)
    cost_per_kwh: float = Field(ge=0)
    fixed_capex: float = Field(ge=0)
    fixed_annual_opex: float = Field(ge=0)
    variable_opex_per_mwh: float = Field(ge=0)
    charging_energy_cost_per_mwh: float = Field(default=0.0, ge=0)
    project_lifetime_years: int = Field(gt=0)
    discount_rate: float = Field(ge=0)
    cycles_per_year: int = Field(gt=0)
    availability_factor: float = Field(default=1.0, ge=0, le=1)
    replacement_cost: float = Field(default=0.0, ge=0)
    replacement_year: int | None = Field(default=None, gt=0)
    end_of_life_cost: float = Field(default=0.0, ge=0)

    @model_validator(mode="after")
    def validate_replacement_year(self):
        if (
            self.replacement_year is not None
            and self.replacement_year > self.project_lifetime_years
        ):
            raise ValueError(
                "replacement_year must be between 1 and project_lifetime_years"
            )

        return self


class ScenarioConfig(BaseModel):
    name: str
    technology: TechnologyConfig
    economics: EconomicsConfig
    losses: LossConfig = LossConfig()


def load_scenario_from_yaml(path: str | Path) -> Scenario:
    file_path = Path(path)

    with file_path.open("r", encoding="utf-8") as file:
        raw_data = yaml.safe_load(file)

    if raw_data is None:
        raise ValueError(f"empty YAML file: {file_path}")

    try:
        config = ScenarioConfig.model_validate(raw_data)
    except ValidationError as error:
        raise ValueError(f"invalid scenario config in {file_path}:\n{error}") from error

    return Scenario(
        name=config.name,
        technology=TechnologyScenario(
            type=config.technology.type,
            mass_kg=config.technology.mass_kg,
            height_m=config.technology.height_m,
            charge_efficiency=config.technology.charge_efficiency,
            discharge_efficiency=config.technology.discharge_efficiency,
            nominal_power_kw=config.technology.nominal_power_kw,
            charge_power_kw=config.technology.charge_power_kw,
            discharge_power_kw=config.technology.discharge_power_kw,
            block_count=config.technology.block_count,
            mass_per_block_kg=config.technology.mass_per_block_kg,
            usable_height_fraction=config.technology.usable_height_fraction,
            structure_cost_per_meter=config.technology.structure_cost_per_meter,
            usable_depth_fraction=config.technology.usable_depth_fraction,
            shaft_rehabilitation_cost=config.technology.shaft_rehabilitation_cost,
            material_density_kg_m3=config.technology.material_density_kg_m3,
            container_volume_m3=config.technology.container_volume_m3,
        ),
        losses=LossScenario(
            additional_cycle_loss_fraction=(
                config.losses.additional_cycle_loss_fraction
            ),
            fixed_cycle_loss_kwh=config.losses.fixed_cycle_loss_kwh,
            standby_loss_stored_kwh_per_hour=(
                config.losses.standby_loss_stored_kwh_per_hour
            ),
        ),
        economics=EconomicScenario(
            cost_per_kw=config.economics.cost_per_kw,
            cost_per_kwh=config.economics.cost_per_kwh,
            fixed_capex=config.economics.fixed_capex,
            fixed_annual_opex=config.economics.fixed_annual_opex,
            variable_opex_per_mwh=config.economics.variable_opex_per_mwh,
            charging_energy_cost_per_mwh=config.economics.charging_energy_cost_per_mwh,
            project_lifetime_years=config.economics.project_lifetime_years,
            discount_rate=config.economics.discount_rate,
            cycles_per_year=config.economics.cycles_per_year,
            availability_factor=config.economics.availability_factor,
            replacement_cost=config.economics.replacement_cost,
            replacement_year=config.economics.replacement_year,
            end_of_life_cost=config.economics.end_of_life_cost,
        ),
    )
