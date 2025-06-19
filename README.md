# [Stickman TD Damage Calculator](https://cyrus01337.github.io/stickman-td-damage-calculator/)

This tool calculates the total damage and total damage multiplier by following a particular formula for the game [Stickman TD](https://www.roblox.com/games/18495650842/Stickman-TD) on Roblox. The tool can be used [here](https://cyrus01337.github.io/stickman-td-damage-calculator/).

### How do I add new equipment?

For those that are not tech-savvy, you may create a new issue at [the issues page](https://github.com/cyrus01337/stickman-td-damage-calculator/issues) and request for an equipment to be added.

For those that are tech-savvy, PRs are welcome. `src/content/equipment` is where all equipment are stored as TOML files for endless examples. Below is a list of options that can be included:

```toml
cooldownReduction = 100
criticalChance = 100
criticalDamage = 100
damage = 100
range = 100
```

Below is an example of Transparent World in TOML form:

```toml
criticalChance = 100
criticalDamage = 50
damage = 100
```

Alternatively, you may contact me directly and I can integrate it for you.

### Formula

$$
(1 + a) * (c^c * (c^d + 1.5) + (1 - c^c)) * ((1 / (1 - c^r_1)) * (1 / (1 - c^r_2)))
$$
