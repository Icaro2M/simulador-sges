from typing import Literal

from pydantic import BaseModel, Field, model_validator


class SimulationRequest(BaseModel):
    name: str = Field(default="Default Scenario")

    technology_type: Literal["tower", "shaft"] = Field(default="tower")
    mass_kg: float = Field(gt=0)
    height_m: float = Field(gt=0)
    nominal_power_kw: float | None = Field(default=None, gt=0)
    charge_power_kw: float | None = Field(default=None, gt=0)
    discharge_power_kw: float | None = Field(default=None, gt=0)

    charge_efficiency: float = Field(gt=0, le=1)
    discharge_efficiency: float = Field(gt=0, le=1)

    cycle_loss_fraction: float = Field(default=0.0, ge=0, lt=1)
    fixed_cycle_loss_kwh: float = Field(default=0.0, ge=0)
    standby_loss_kwh_per_hour: float = Field(default=0.0, ge=0)

    cost_per_kw: float = Field(ge=0)
    cost_per_kwh: float = Field(ge=0)
    fixed_capex: float = Field(ge=0)
    fixed_annual_opex: float = Field(ge=0)
    variable_opex_per_mwh: float = Field(ge=0)
    project_lifetime_years: int = Field(gt=0)
    discount_rate: float = Field(ge=0, lt=1)
    cycles_per_year: int = Field(gt=0)

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
