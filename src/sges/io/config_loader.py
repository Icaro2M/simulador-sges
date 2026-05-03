from pathlib import Path

import yaml
from pydantic import BaseModel, Field, ValidationError, model_validator

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

        return self


class LossConfig(BaseModel):
    cycle_loss_fraction: float = Field(default=0.0, ge=0, lt=1)
    fixed_cycle_loss_kwh: float = Field(default=0.0, ge=0)
    standby_loss_kwh_per_hour: float = Field(default=0.0, ge=0)


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
        ),
        losses=LossScenario(
            cycle_loss_fraction=config.losses.cycle_loss_fraction,
            fixed_cycle_loss_kwh=config.losses.fixed_cycle_loss_kwh,
            standby_loss_kwh_per_hour=config.losses.standby_loss_kwh_per_hour,
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
        ),
    )
