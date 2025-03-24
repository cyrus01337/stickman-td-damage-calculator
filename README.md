# [Stickman TD Damage Calculator](https://cyrus01337.github.io/stickman-td-damage-calculator/)

This tool calculates the total damage and total damage multiplier by following a particular formula for the game [Stickman TD](https://www.roblox.com/games/18495650842/Stickman-TD) on Roblox. The tool can be used [here](https://cyrus01337.github.io/stickman-td-damage-calculator/).

### How do I add new equipment?

If you look at `src/content/equipment`, there are a ton of TOML files that contain data for each piece of equipment. Below is a list of options that can be included:

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

<!-- TODO: Create a form that allows users to trivially create PRs -->

For those who are comfortable with tech/are tech-savvy, you can create a PR directly to the repo and I will happily include it, otherwise you may contact me directly and I shall integrate it for you.

There will be a more easy way to submit equipment soon.

### Formula

$$
(1 + a) * (c^c * (c^d + 1.5) + (1 - c^c)) * ((1 / (1 - c^r_1)) * (1 / (1 - c^r_2)))
$$
