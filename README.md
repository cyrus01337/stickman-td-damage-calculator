# [Stickman TD Damage Calculator](https://cyrus01337.github.io/stickman-td-damage-calculator/)

This tool calculates the total damage and total damage multiplier by following a particular formula for the game [Stickman TD](https://www.roblox.com/games/18495650842/Stickman-TD) on Roblox. The tool can be used [here](https://cyrus01337.github.io/stickman-td-damage-calculator/).

### Formula

$$
a = Attack damage \\
c^c = Critical Chance \\
c^d = Critical Damage \\
c^r = Cooldown Reduction \\
(1 + a) * (c^c * (c^d + 1.5) + (1 - c^c)) * ((1 / (1 - c^r_1)) * (1 / (1 - c^r_2)))
$$
