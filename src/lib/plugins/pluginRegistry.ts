import { Plugin } from '../../types/plugin';

const pluginRegistry: Plugin[] = [
  {
    name: "Strategy Sync",
    description: "Syncs strategies across agents and tenants.",
    version: "1.0.0",
  },
  {
    name: "Performance Logger",
    description: "Tracks agent XP, success rates, and feedback.",
    version: "1.1.0",
  }
];

export default pluginRegistry;
