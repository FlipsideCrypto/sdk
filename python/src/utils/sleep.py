import time
from typing import Union

from ..models.sleep_config import SleepConfig


def sec_to_ms(sec: int):
    return sec * 1000


def get_exp_backoff_seconds(attempts: Union[int, float]):
    return 2**attempts


def get_linear_backoff_seconds(
    attempts: Union[int, float], interval_seconds: Union[int, float]
):
    return (attempts + 1) * interval_seconds


def get_elapsed_exp_seconds(config: SleepConfig):
    if not config.interval_seconds:
        raise Exception("intervalSeconds is required for `get_elapsed_exp_seconds`")

    elapsed_seconds = 0
    for i in range(config.attempts):
        elapsed_seconds += get_exp_backoff_seconds(i)

    return elapsed_seconds


def exp_backoff(config: SleepConfig):
    if not config.interval_seconds:
        raise Exception("intervalSeconds is required for `exp_backoff`")

    elapsed_seconds = get_elapsed_exp_seconds(config)
    should_continue = True
    if elapsed_seconds / 60 > config.timeout_minutes:
        should_continue = False
        return should_continue

    time.sleep(get_exp_backoff_seconds(config.attempts * config.interval_seconds))

    return should_continue


def get_elapsed_linear_seconds(config: SleepConfig):
    if not config.interval_seconds:
        raise Exception("intervalSeconds is required for `get_elapsed_linear_seconds`")

    elapsed_seconds = 0
    for i in range(config.attempts):
        elapsed_seconds += get_linear_backoff_seconds(i, config.interval_seconds)

    return elapsed_seconds


def linear_backoff(config: SleepConfig):
    if not config.interval_seconds:
        raise Exception("intervalSeconds is required for `linear_backoff`")

    elapsed_seconds = get_elapsed_linear_seconds(config)
    should_continue = True
    if elapsed_seconds / 60 > config.timeout_minutes:
        should_continue = False
        return should_continue

    time.sleep(get_linear_backoff_seconds(config.attempts, config.interval_seconds))

    return should_continue
