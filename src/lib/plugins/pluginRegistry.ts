
import { Strategy } from "@/types/strategy";

export type PluginHook = {
  onStrategyLaunch?: (strategy: Strategy) => Promise<void>;
  onKpiReport?: (data: any) => Promise<void>;
};

const registry: Record<string, PluginHook> = {};

export function registerPlugin(key: string, hook: PluginHook) {
  registry[key] = hook;
}

export function getPluginHooks() {
  return registry;
}
