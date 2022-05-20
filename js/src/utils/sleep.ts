import { SleepConfig } from "../types/sleep-config.type";
import { secToMs } from "./time";

export async function sleep(ms: number): Promise<undefined> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getExpBackOffSeconds(attempts: number) {
  return Math.pow(2, attempts);
}

function getLinearBackOffSeconds(attempts: number, intervalSeconds: number) {
  return (attempts + 1) * intervalSeconds;
}

export function getElapsedExpSeconds(config: SleepConfig) {
  if (!config.intervalSeconds) {
    throw new Error("intervalSeconds is required for getElapsedLinearTime");
  }
  let elapsedSeconds = 0;
  for (let i = 0; i < config.attempts; i++) {
    elapsedSeconds += getExpBackOffSeconds(i);
  }
  return elapsedSeconds;
}

export async function expBackOff(config: SleepConfig): Promise<boolean> {
  if (!config.intervalSeconds) {
    throw new Error("intervalSeconds is required for getElapsedLinearTime");
  }

  let elapsedSeconds = getElapsedExpSeconds(config);

  let shouldContinueBackoff = true;
  if (elapsedSeconds / 60 > config.timeoutMinutes) {
    shouldContinueBackoff = false;
    return shouldContinueBackoff;
  }

  const msToSleep = secToMs(
    getExpBackOffSeconds(config.attempts * config.intervalSeconds)
  );

  await sleep(msToSleep);

  return shouldContinueBackoff;
}

export function getElapsedLinearSeconds(config: SleepConfig) {
  if (!config.intervalSeconds) {
    throw new Error("intervalSeconds is required for getElapsedLinearTime");
  }
  let elapsedSeconds = 0;
  for (let i = 0; i < config.attempts; i++) {
    elapsedSeconds += getLinearBackOffSeconds(i, config.intervalSeconds);
  }
  return elapsedSeconds;
}

export async function linearBackOff(config: SleepConfig): Promise<boolean> {
  if (!config.intervalSeconds) {
    throw new Error("intervalSeconds is required for linearBackOff");
  }

  let elapsedSeconds = getElapsedLinearSeconds(config);

  let shouldContinueBackoff = true;
  if (elapsedSeconds / 60 > config.timeoutMinutes) {
    shouldContinueBackoff = false;
    return shouldContinueBackoff;
  }

  const msToSleep = secToMs(
    getLinearBackOffSeconds(config.attempts, config.intervalSeconds)
  );

  await sleep(msToSleep);

  return shouldContinueBackoff;
}
