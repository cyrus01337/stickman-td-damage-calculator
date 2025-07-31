# [Stickman TD Damage Calculator](https://cyrus01337.github.io/stickman-td-damage-calculator/)

This tool calculates the total damage and total damage multiplier by following a particular formula for the game [Stickman TD](https://www.roblox.com/games/18495650842/Stickman-TD) on Roblox. The tool can be used [here](https://cyrus01337.github.io/stickman-td-damage-calculator/).

### How do I add new equipment?

For those that are not tech-savvy, you may create a new issue at [the issues page](https://github.com/cyrus01337/stickman-td-damage-calculator/issues) and request for an equipment to be added.

For those that are tech-savvy, PRs are welcome. `src/content/equipment` is where all equipment are stored as TOML files for endless examples. Below is a list of options that can be included:

```toml
cooldownReduction = 100
criticalChance = 100
criticalDamage = 100
range = 100

[damage]
all = 100
blunt = 100
chaos = 100
elements = 100
fire = 100
frost = 100
radiant = 100
slash = 100
stab = 100
umbral = 100
```

Below are examples for how certain stats are represented in TOML form:
- [Devote](https://github.com/cyrus01337/stickman-td-damage-calculator/blob/main/src/content/equipment/devote.toml)
- [Transparent World](https://github.com/cyrus01337/stickman-td-damage-calculator/blob/main/src/content/equipment/transparent-world.toml)
- [Reaper](https://github.com/cyrus01337/stickman-td-damage-calculator/blob/main/src/content/equipment/reaper.toml)

Alternatively, you may contact me directly and I can integrate it for you.

### Formula

**Note:** Berserker does not fully abide by this formula, keep this in mind when factoring in his elemental damage

$$
(1 + ae) * (c^c * (c^d + 1.5) + (1 - c^c)) * ((1 / (1 - c^r_1)) * (1 / (1 - c^r_2)))
$$
