from ...models.sleep_config import SleepConfig
from ...utils.sleep import (
    exp_backoff,
    get_elapsed_exp_seconds,
    get_elapsed_linear_seconds,
    get_exp_backoff_seconds,
    get_linear_backoff_seconds,
    linear_backoff,
    sec_to_ms,
)


def test_sec_to_ms():
    assert sec_to_ms(1) == 1000


def test_get_exp_backoff_seconds():
    assert get_exp_backoff_seconds(0) == 1
    assert get_exp_backoff_seconds(2) == 4


def test_get_linear_backoff_seconds():
    assert get_linear_backoff_seconds(0, 0) == 0
    assert get_linear_backoff_seconds(0, 1) == 1
    assert get_linear_backoff_seconds(1, 1) == 2
    assert get_linear_backoff_seconds(1, 2) == 4


def test_get_elapsed_exp_seconds():
    sc = SleepConfig(attempts=1, interval_seconds=5, timeout_minutes=5)
    assert get_elapsed_exp_seconds(sc) == 1

    sc = SleepConfig(attempts=2, interval_seconds=5, timeout_minutes=5)
    assert get_elapsed_exp_seconds(sc) == 3

    sc = SleepConfig(attempts=3, interval_seconds=5, timeout_minutes=5)
    assert get_elapsed_exp_seconds(sc) == 7


def test_exp_backoff():
    sc = SleepConfig(attempts=1, interval_seconds=0.1, timeout_minutes=5)
    should_continue = exp_backoff(sc)
    assert should_continue is True

    sc = SleepConfig(attempts=1, interval_seconds=0.1, timeout_minutes=0.0001)
    should_continue = exp_backoff(sc)
    assert should_continue is False


def test_get_elapsed_linear_seconds():
    sc = SleepConfig(attempts=0, interval_seconds=5, timeout_minutes=5)
    assert get_elapsed_linear_seconds(sc) == 0

    sc = SleepConfig(attempts=1, interval_seconds=5, timeout_minutes=5)
    assert get_elapsed_linear_seconds(sc) == 5

    sc = SleepConfig(attempts=2, interval_seconds=5, timeout_minutes=5)
    assert get_elapsed_linear_seconds(sc) == 15

    sc = SleepConfig(attempts=3, interval_seconds=5, timeout_minutes=5)
    assert get_elapsed_linear_seconds(sc) == 30


def test_linear_backoff():
    sc = SleepConfig(attempts=1, interval_seconds=0.1, timeout_minutes=5)
    should_continue = linear_backoff(sc)
    assert should_continue is True

    sc = SleepConfig(attempts=1, interval_seconds=0.1, timeout_minutes=0.0001)
    should_continue = linear_backoff(sc)
    assert should_continue is False
