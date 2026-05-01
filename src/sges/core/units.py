from sges.core.constants import JOULES_PER_KWH


def joules_to_kwh(value_j: float) -> float:
    return value_j / JOULES_PER_KWH


def kwh_to_joules(value_kwh: float) -> float:
    return value_kwh * JOULES_PER_KWH


def kw_to_w(value_kw: float) -> float:
    return value_kw * 1000.0


def w_to_kw(value_w: float) -> float:
    return value_w / 1000.0