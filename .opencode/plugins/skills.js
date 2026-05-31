/**
 * Skills plugin for OpenCode
 *
 * Registers all skills in this repo with OpenCode's skill discovery system.
 * No symlinks or manual config edits required.
 *
 * Adapted from obra/superpowers (.opencode/plugins/superpowers.js)
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Repo root is two levels up from .opencode/plugins/
const skillsRoot = path.resolve(__dirname, '../..');

export const SkillsPlugin = async ({ client, directory }) => {
  return {
    // Inject the repo root into OpenCode's skills path list so all root-level
    // skill directories are auto-discovered without any manual configuration.
    //
    // This works because Config.get() returns a cached singleton — the push
    // here is visible when OpenCode lazily discovers skills later in the session.
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsRoot)) {
        config.skills.paths.push(skillsRoot);
      }
    }
  };
};
