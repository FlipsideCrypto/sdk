import time

from shroomdk.models.sleep_config import SleepConfig

def sec_to_ms(sec: int):
    return sec * 1000

def get_exp_backoff_seconds(attempts: int | float):
    return 2**attempts


def get_linear_backoff_seconds(attempts: int | float, interval_seconds: int | float):
    return (attempts + 1) * interval_seconds


def get_elapsed_exp_seconds(config: SleepConfig):
    if (not config.interval_seconds):
        raise Exception("intervalSeconds is required for `get_elapsed_exp_seconds`")
    
    elapsed_seconds = 0
    for i in range(config.attempts):
        elapsed_seconds += get_exp_backoff_seconds(i)
    
    return elapsed_seconds


def exp_backoff(config: SleepConfig):
    if (not config.interval_seconds):
        raise Exception("intervalSeconds is required for `exp_backoff`")
    
    elapsed_seconds = get_elapsed_exp_seconds(config)
    should_continue = True
    if elapsed_seconds / 60 > config.timeout_minutes:
        should_continue = False
        return should_continue
    
    time.sleep(get_exp_backoff_seconds(config.attempts * config.interval_seconds))
    
    return should_continue


def get_elapsed_linear_seconds(config: SleepConfig):
    if (not config.interval_seconds):
        raise Exception("intervalSeconds is required for `get_elapsed_linear_seconds`")

    elapsed_seconds = 0
    for i in range(config.attempts):
        elapsed_seconds += get_linear_backoff_seconds(i, config.interval_seconds)

    return elapsed_seconds


def linear_backoff(config: SleepConfig): 
    if (not config.interval_seconds):
        raise Exception("intervalSeconds is required for `linear_backoff`")

    elapsed_seconds = get_elapsed_linear_seconds(config)
    should_continue = True
    if elapsed_seconds / 60 > config.timeout_minutes:
        should_continue = False
        return should_continue
    print("sleeping for {} seconds".format(get_linear_backoff_seconds(config.attempts, config.interval_seconds)))
    time.sleep(get_linear_backoff_seconds(config.attempts, config.interval_seconds))
    
    return should_continue


# import { SleepConfig } from "../types/sleep-config.type";
# import { secToMs } from "./time";

# export async function sleep(ms: number): Promise<undefined> {
#   return new Promise((resolve) => setTimeout(resolve, ms));
# }

# function getExpBackOffSeconds(attempts: number) {
#   return Math.pow(2, attempts);
# }

# function getLinearBackOffSeconds(attempts: number, intervalSeconds: number) {
#   return (attempts + 1) * intervalSeconds;
# }

# export function getElapsedExpSeconds(config: SleepConfig) {
#   if (!config.intervalSeconds) {
#     throw new Error("intervalSeconds is required for getElapsedLinearTime");
#   }
#   let elapsedSeconds = 0;
#   for (let i = 0; i < config.attempts; i++) {
#     elapsedSeconds += getExpBackOffSeconds(i);
#   }
#   return elapsedSeconds;
# }

# export async function expBackOff(config: SleepConfig): Promise<boolean> {
#   if (!config.intervalSeconds) {
#     throw new Error("intervalSeconds is required for getElapsedLinearTime");
#   }

#   let elapsedSeconds = getElapsedExpSeconds(config);

#   let shouldContinueBackoff = true;
#   if (elapsedSeconds / 60 > config.timeoutMinutes) {
#     shouldContinueBackoff = false;
#     return shouldContinueBackoff;
#   }

#   const msToSleep = secToMs(
#     getExpBackOffSeconds(config.attempts * config.intervalSeconds)
#   );

#   await sleep(msToSleep);

#   return shouldContinueBackoff;
# }

# export function getElapsedLinearSeconds(config: SleepConfig) {
#   if (!config.intervalSeconds) {
#     throw new Error("intervalSeconds is required for getElapsedLinearTime");
#   }
#   let elapsedSeconds = 0;
#   for (let i = 0; i < config.attempts; i++) {
#     elapsedSeconds += getLinearBackOffSeconds(i, config.intervalSeconds);
#   }
#   return elapsedSeconds;
# }

# export async function linearBackOff(config: SleepConfig): Promise<boolean> {
#   if (!config.intervalSeconds) {
#     throw new Error("intervalSeconds is required for linearBackOff");
#   }

#   let elapsedSeconds = getElapsedLinearSeconds(config);

#   let shouldContinueBackoff = true;
#   if (elapsedSeconds / 60 > config.timeoutMinutes) {
#     shouldContinueBackoff = false;
#     return shouldContinueBackoff;
#   }

#   const msToSleep = secToMs(
#     getLinearBackOffSeconds(config.attempts, config.intervalSeconds)
#   );

#   await sleep(msToSleep);

#   return shouldContinueBackoff;
# }
