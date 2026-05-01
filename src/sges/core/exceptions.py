class SGESException(Exception):
    pass


class InvalidParameterError(SGESException):
    pass


class SimulationError(SGESException):
    pass