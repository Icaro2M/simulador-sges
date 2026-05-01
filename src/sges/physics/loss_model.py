from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError


@dataclass(frozen=True)
class LossModel:
    cycle_loss_fraction: float = 0.0
    fixed_cycle_loss_kwh: float = 0.0
    standby_loss_kwh_per_hour: float = 0.0

    def validate(self) -> None:
        if self.cycle_loss_fraction < 0 or self.cycle_loss_fraction >= 1:
            raise InvalidParameterError("cycle_loss_fraction must be in the interval [0, 1)")

        if self.fixed_cycle_loss_kwh < 0:
            raise InvalidParameterError("fixed_cycle_loss_kwh must be greater than or equal to zero")

        if self.standby_loss_kwh_per_hour < 0:
            raise InvalidParameterError("standby_loss_kwh_per_hour must be greater than or equal to zero")

    def apply_cycle_losses(self, energy_kwh: float) -> float:
        self.validate()

        if energy_kwh < 0:
            raise InvalidParameterError("energy_kwh must be greater than or equal to zero")

        after_fraction_loss = energy_kwh * (1 - self.cycle_loss_fraction)
        after_fixed_loss = max(after_fraction_loss - self.fixed_cycle_loss_kwh, 0.0)

        return after_fixed_loss

    def calculate_standby_loss(self, hours: float) -> float:
        self.validate()

        if hours < 0:
            raise InvalidParameterError("hours must be greater than or equal to zero")

        return self.standby_loss_kwh_per_hour * hours