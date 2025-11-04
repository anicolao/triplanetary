# Triplanetary Game Rules

## Overview

Triplanetary is a science fiction board game of ship-to-ship space combat and racing in the inner solar system. The game features realistic Newtonian physics where ships maintain momentum and velocity between turns.

## Game Components

### The Map
- Hexagonal grid representing space in the inner solar system
- Planetary orbits: Mercury, Venus, Earth, and Mars
- The Sun at the center
- Asteroid belt between Mars and Jupiter
- Various space stations and bases

### Ships

Triplanetary depicts nine different types of ships, plus orbital bases. Each ship has the following characteristics:
- **Combat Strength**: Offensive and defensive combat capability
- **Fuel Capacity**: Available fuel/engine power for thrust
- **Cargo Capacity**: Space for transporting goods (in tons)
- **Cost**: Purchase price in MegaCredits (MCr)

#### Ship Types

**Civilian Ships:**

- **Transport** - A basic cargo ship with minimal defense and no weapons.
  - Combat Strength: 1D (defensive only)
  - Fuel Capacity: 10
  - Cargo Capacity: 50 tons
  - Cost: 10 MCr

- **Tanker** - Nothing but drive, crew quarters, and fuel tanks – no weapons.
  - Combat Strength: 1D (defensive only)
  - Fuel Capacity: 50
  - Cargo Capacity: 0 tons
  - Cost: 10 MCr

- **Liner** - A specialized craft for carrying passengers. It has no weapons and no capacity for other cargo.
  - Combat Strength: 2D (defensive only)
  - Fuel Capacity: 10
  - Cargo Capacity: 0 tons
  - Cost: 50 MCr

- **Packet** - A transport with extra armor and reinforcement, and a couple of railguns for self-defense. May be used by both civilian and military; packets are allowed to anyone who could buy a transport unless a scenario states otherwise.
  - Combat Strength: 2
  - Fuel Capacity: 10
  - Cargo Capacity: 50 tons
  - Cost: 20 MCr

**Military Ships:**

- **Corvette** - The smallest warship.
  - Combat Strength: 2
  - Fuel Capacity: 20
  - Cargo Capacity: 5 tons
  - Cost: 40 MCr

- **Corsair** - A flexible mid-sized warship.
  - Combat Strength: 4
  - Fuel Capacity: 20
  - Cargo Capacity: 10 tons
  - Cost: 80 MCr

- **Frigate** - A large warship.
  - Combat Strength: 8
  - Fuel Capacity: 20
  - Cargo Capacity: 40 tons
  - Cost: 150 MCr

- **Dreadnaught** - An extremely large warship with a lot of armor and ordnance capacity. It has fewer fuel points than smaller warships.
  - Combat Strength: 15
  - Fuel Capacity: 15
  - Cargo Capacity: 50 tons
  - Cost: 600 MCr

- **Torchship** - An experimental warship with unlimited fuel. It has the guns, but not the hold capacity, of a frigate.
  - Combat Strength: 8
  - Fuel Capacity: Unlimited (∞)
  - Cargo Capacity: 10 tons
  - Cost: 400 MCr

**Orbital Base** - A large structure, armed and armored for combat, which also serves as a resupply point for friendly ships.
  - Combat Strength: 16
  - Fuel Capacity: Unlimited fuel store
  - Cargo Capacity: Unlimited cargo hold
  - Cost: 1000 MCr
  - Special: Uses special combat rules

*Note: Ships with a "D" after their combat strength (like 1D, 2D) may not attack or counterattack; their strength is defensive only. Warships and packets have a combat strength without the D suffix; they may attack normally.*

## Core Mechanics

### Movement

Movement in Triplanetary uses a unique vector-based system:

1. **Current Velocity**: Each ship has a velocity arrow showing direction and speed
2. **Thrust Application**: Players spend thrust points to modify their velocity
3. **Movement Execution**: Ships move according to their velocity vector
4. **Momentum Conservation**: Velocity carries over to the next turn

#### Movement Steps (Each Turn)
1. Plot your velocity arrow from your current position
2. Optionally spend thrust points to modify the arrow (change direction or speed)
3. Move your ship to the hex indicated by the arrow's endpoint
4. The arrow becomes your new velocity for the next turn

#### Thrust Application Rules
- Each thrust point can shift your velocity arrow by one hex
- You can spend multiple thrust points in a single direction
- Thrust can be used to accelerate, decelerate, or change direction
- Ships have limited thrust points per turn

### Gravity

The planets, satellites, and sun all exert gravity on objects passing close to them. This gravity is represented by **arrows in hexes adjacent to those bodies**.

#### Gravity Mechanics

**Each gravity hex has the effect of one hex of acceleration in the direction of the arrow**, on every object passing through that hex. 

**Key Rules:**
- Gravity takes effect **on the turn after** an object enters the gravity hex
- Gravity is **cumulative** - multiple gravity hexes affect the ship in sequence
- Gravity is **mandatory** - it cannot be avoided

**How Gravity Works:**
1. When a ship enters a gravity hex on turn 1, note which gravity hex(es) it entered
2. On turn 2, after the ship completes its normal movement, apply the gravity effect(s)
3. Each gravity hex shifts the ship's endpoint by one hex in the direction of the arrow
4. Multiple gravity hexes are applied in sequence (the order matters)

**Example:** A ship entering gravity hexes I and II on turn 1 will have its course endpoint shifted by hex I's arrow first, then by hex II's arrow on turn 2. The cumulative effect moves the ship's final position.

#### Weak Gravity

Luna and Io have **weak gravity**. A ship entering a weak gravity hex may **choose to ignore it or use it**. When two or more weak gravity hexes are entered in the same turn, they combine to have the effect of full gravity hexes, regardless of how the player chooses to use them individually.

#### Orbits

Ships may enter orbit around any body with gravity hexes. **A ship which moves at one hex per turn from one gravity hex to an adjacent gravity hex of the same body is in orbit.** Such a ship will continue to orbit until fuel is burned to produce a course change.

#### Gravity and Movement

- The line between a gravity hex and the planetary outline is affected by the gravity hex
- A ship's course running exactly along the edge of a gravity hex means the ship has not entered that gravity hex
- Gravity effects are applied after the ship moves to its plotted endpoint

### Combat

#### Gun Combat

Ships may attack using guns during the combat phase. To resolve an attack:

**1. Determine Combat Odds**
- Calculate the ratio of attacker's combat strength to defender's combat strength
- Multiple ships may gang up on a single target; add their combat strengths together
- Combat odds are expressed as ratios: 1:4, 1:2, 1:1, 2:1, 3:1, 4:1
- Attacks at better than 4:1 use the 4:1 column
- Attacks at less than 1:4 have no effect

**2. Determine Range**
Range is the attacker's closest approach to the target's final position (measured in hexes).
- Look at the attacker's vector and count hexes to the defender's final position
- The defender's vector does not matter for range calculation
- Subtract the range from the die roll: a range of 4 subtracts 4 from the roll

**3. Determine Relative Velocity**
The velocity difference between attacker and defender affects accuracy:
- Plot both ships' course vectors from a common point
- Count the hexes separating the two course endpoints
- Subtract 1 from the die roll for each hex of velocity difference greater than 2
- In multiple ship attacks, use the greatest applicable velocity difference

**4. Roll and Apply Damage**
- Roll one die
- Apply range and relative velocity modifiers
- A die roll modified to less than 1 has no effect
- A die roll modified to more than 6 is treated as 6
- Consult the Gun Combat Damage Table

**Gun Combat Damage Table:**

| Roll | 1:4 | 1:2 | 1:1 | 2:1 | 3:1 | 4:1 |
|------|-----|-----|-----|-----|-----|-----|
| 1    | –   | –   | –   | –   | –   | D2  |
| 2    | –   | –   | –   | –   | D2  | D3  |
| 3    | –   | –   | –   | D2  | D3  | D4  |
| 4    | –   | –   | D2  | D3  | D4  | D5  |
| 5    | –   | D2  | D3  | D4  | D5  | E   |
| 6    | D1  | D3  | D4  | D5  | E   | E   |

**Damage Levels:**
- **D1** - Disabled for 1 turn. Ship recovers 1 D level per turn.
- **D2** - Disabled for 2 turns. Ship recovers 1 D level per turn.
- **D3** - Disabled for 3 turns. Ship recovers 1 D level per turn.
- **D4** - Disabled for 4 turns. Ship recovers 1 D level per turn.
- **D5** - Disabled for 5 turns. Ship recovers 1 D level per turn.
- **E** - Eliminated. The target ship is destroyed.

**Damage is cumulative:** If a ship is already disabled, new damage results are added to its current period of disablement. **If a ship ever reaches D6 or greater, it is destroyed.**

**While Disabled (any D level):**
A disabled ship cannot maneuver, launch ordnance, or attack. It may only drift on its current course. Disabled ships can be looted or captured.

**Exceptions:**
- Ships with "D" combat ratings (like transports, tankers, liners) may not attack or counterattack, though they still defend.
- Dreadnaughts may still fire their guns (only) even though disabled.
- An orbital base may launch torpedoes, fire guns, and resupply friendly ships while slightly (D1) damaged.

**Damage Recovery:**
Ships recover at the rate of one D per turn at the end of the Resupply phase.

## Game Scenarios

The 2018 rules include several official scenarios for learning and competitive play:

### Bi-Planetary (Two-player learning scenario)
One player starts with a corvette on Mars, one on Venus. Each player must navigate to the other world and land. The winner is the one who does it in the fewest turns.

**Variant:** For a longer and harder route, use Mercury and Ganymede (watch out for asteroids).

### Grand Tour (Multi-player racing scenario)
Each ship must pass through at least one gravity hex of each astral body with full gravity (the six habitable worlds plus Jupiter and the Sun) and return to land on its starting world. The first ship to complete the tour wins.

**Special Rules:**
- Fuel is available only at bases on Terra, Venus, Mars, and Callisto
- No cost for fuel
- Combat is not allowed (but see variants)

**Victory:** First ship to complete the tour wins. In case of ties, lowest fuel consumption wins.

**Variants:**
- Start all players on Terra
- Announce required route order just prior to race
- Allow combat (with penalties for attacking in detection range of worlds)

### Escape (Short two-player scenario)
The Pilgrims, oppressed by the First Citizen and his Enforcers, have secretly prepared a transport and two decoys for an escape to the stars. The transport must leave the Solar System with enough fuel for maneuver and deceleration.

**Ships:**
- Pilgrims: Three transports on Terra (one contains fugitives, two are decoys)
- Enforcers: One corvette in orbit around Terra, one corsair in orbit around Venus

**Special Rules:**
- Pilgrim secretly designates which transport contains fugitives
- Ship identities revealed only when inspected or at game end
- Mines and torpedoes not available
- No time limit

**Victory Levels:**
- Decisive Pilgrim victory: Fugitive ship exits beyond Jupiter with sufficient fuel
- Marginal Pilgrim victory: Exit as above but with less fuel
- Moral Pilgrim victory: Destroyed/captured but disabled at least one Enforcer ship
- Marginal Enforcer victory: Destroy transport with Pilgrims
- Decisive Enforcer victory: Capture Pilgrims and return safely to base

### Lateral 7 (Short two-player scenario)
A liner travels from Venus to Ganymede carrying industrial magnates. Pirates from Clandestine base attempt to capture the passengers for ransom. A Navy dreadnaught (Tycho Brahe) is on station to respond.

**Ships:**
- Pirates: Two corsairs, one corvette, plus dummy counters
- Navy: One dreadnaught, three dummy frigates, plus dummies

**Special Rules:**
- Pirates know liner location (published sailings)
- Dreadnaught cannot move until a pirate is detected
- Each ship removes dummies on first acceleration

**Victory:**
- Pirate wins: Match course with liner, transfer passengers to Clandestine
- Navy wins: Liner makes it to Ganymede
- Decisive victory: Also destroy an enemy ship
- Both lose: If passengers are destroyed

### Piracy (Long three-player campaign scenario)
The System's economy is threatened by pirates from their asteroid belt base. Three players represent the Patrol, Merchants, and Pirates in an extended campaign.

**The Patrol:**
- Starts with dreadnaught and corsair on Luna
- Pre-plots patrol circuits in Inner and Outer System
- Earns points for destroying pirates
- Can buy new ships (2 points per combat strength point)

**The Merchants:**
- Start with transports on various worlds
- Make cargo runs for profit
- Ships earn MCr based on type and route
- Can buy new ships and equipment

**The Pirates:**
- Start with corsairs on Clandestine
- Attack merchant shipping for loot
- Can capture and ransom ships
- May only refuel at Clandestine (or hidden tankers)

**Special Rules:**
- Detection rules apply (5 hexes for worlds, 3 for ships)
- Pirates can sell captured ships at Clandestine (75% value) or Ceres (50%)
- Prospectors can mine asteroids for additional income
- Referee may modify social rules to keep game interesting

**Victory:** Play to specified number of turns or sessions, then calculate net worth. Or play open-ended campaign.

### Racing Scenarios (General)
- Navigate through gates or checkpoints
- First ship to complete the course wins
- Must manage fuel efficiently
- Gravity assists can provide advantages

### Combat Scenarios (General)
- Destroy enemy ships
- Protect convoys or stations
- Capture objectives
- Last ship standing wins

### Campaign Scenarios (General)
- Linked missions with persistent ship status
- Resource management between missions
- Ship upgrades and repairs
- Multiple objectives and victory conditions

## Turn Sequence

Each turn represents one day. At the start of the game, randomly determine player turn order (or by mutual consent). This order remains fixed for the entire game.

Each round, players take their turns in order. Each player-turn is composed of five phases:

### 1. Astrogation Phase
The player examines the map and ship positions and plots the **predicted courses** of all their ships, based on their previous courses. A ship which is not accelerated by thrust or gravity will move as it did in the previous turn, in the same direction, traveling an equal distance.

Working from these predicted courses, the player determines what changes (if any) to make, and alters the courses accordingly:
- Each ship may burn **one fuel point per turn**
- One fuel point allows a ship to alter its predicted course by one hex in any direction
- This may result in turning, speeding up, or slowing down
- A straight line from the ship's original position to the new endpoint represents the ship's velocity for that turn
- This arrow also serves as the basis for course prediction on the next turn

### 2. Ordnance Phase
Spaceships may declare that they are launching ordnance (mines, torpedoes, nukes) during this phase. Each ship may release only one item per turn. Ordnance may not be launched while the ship is at a base, refueling, or taking off from or landing on a planet.

### 3. Movement Phase
Spaceships move along their plotted courses to their new plotted positions. Mines, torpedoes, and nukes launched by the phasing player (on this or previous turns) also move at this time. If ordnance encounters a target, it explodes during this phase. If astrogation hazards were encountered, their effects are rolled for during this phase.

### 4. Combat Phase
Spaceships may attack enemy targets using guns. The targets may counterattack using guns. If astrogation hazards were encountered during the movement phase, their effects are rolled for during this phase.

### 5. Resupply Phase
Spaceships may refuel, resupply, load and unload cargo, loot captured ships, or rescue, as appropriate. Damage is recovered (ships recover from 1 damage level per turn automatically).

After all players have completed their turns, the round ends and a new round begins with the first player.

## Ordnance

### Mines
Mines are clusters of explosive charges with no motive power of their own. When a mine is launched, it assumes the vector of its launching ship. That ship must execute an immediate course change to ensure it does not remain in the same hex as the mine.

- Mines remain active for 5 turns, after which they self-destruct
- Mines move during the movement phase of the player who launched them
- A mine detonates when a ship's course passes through its hex, or when the mine's course passes through a hex occupied by a ship or ordnance
- At the instant of contact, each affected ship rolls one die and consults the mine damage table
- If multiple ships are in the affected hex, each rolls separately
- Mines mass 10 tons; a carrying ship must have hold capacity to carry it
- Any ship with sufficient capacity may launch a mine

**Other Damage Table:**

| Roll | Torpedoes | Mines | Asteroid | Ram |
|------|-----------|-------|----------|-----|
| 1    | –         | –     | –        | –   |
| 2    | D1        | –     | –        | –   |
| 3    | D1        | –     | –        | D1  |
| 4    | D1        | –     | –        | D1  |
| 5    | D2        | D2    | D1       | D3  |
| 6    | D3        | D2    | D2       | D5  |

### Torpedoes
Torpedoes are large single mines with drive systems for both launch and terminal guidance. A torpedo is treated as a mine, except:
- On the turn launched (and only that turn), it may accelerate one or two hexes in any direction
- It maintains its new vector for 5 turns, then self-destructs
- A torpedo hits only a single target in a hex (roll for each ship in order until one is damaged)
- A torpedo that misses continues and may find new targets
- Torpedoes mass 20 tons; only warships may launch torpedoes

### Nukes
Nukes are large nuclear weapons intended to devastate planetary surfaces. When launched, they assume the vector of the launching ship.
- Nukes remain active for 5 turns, then self-destruct
- A nuke explodes when it enters any hex containing a ship, base, asteroid, mine, or torpedo
- **A nuke destroys everything in the hex automatically** (an asteroid hex becomes clear space)
- If a nuke reaches a moon or planet without detonating, it devastates one entire hex side:
  - Any ships on the planet that landed through that hex side are destroyed
  - Any base on that side is destroyed
  - Planetary defenses on that side are destroyed (20 turns to rebuild)
- Guns and planetary defenses may attack nukes at odds of 2:1 (with range and velocity modifiers)
- A "disabled" nuke is destroyed
- Nukes mass 20 tons; a ship must have hold capacity to carry them
- Non-warships are restricted to carrying only one nuke at a time
- Nukes cost 300 MCr and are available only if the scenario specifies

### Equipment Costs and Mass

| Equipment Type | Cost (MCr) | Mass (tons) | Remarks |
|----------------|------------|-------------|---------|
| Fuel | * | – | Available at bases |
| Mine | 10 | 10 | – |
| Torpedo | 20 | 20 | – |
| Nuke | 300 | 20 | – |
| Scanners | 30 | – | Navigation at Clandestine |

*Fuel is available at any friendly base. If no cost is given in the scenario, fuel is free.

## Special Rules

### Docking
- Ships can dock at stations or planets
- Must match velocity with target
- Allows refueling and repairs
- Cargo transfer occurs when docked

### Overload Maneuver
A ship may "overload" its drive to burn more than one fuel point per turn:
- A ship may burn up to 2 fuel points per turn by overloading
- Overloading risks damage to the ship's systems
- This allows for emergency maneuvers or rapid course changes
- Note: This is an optional advanced rule not used in all scenarios

### Ramming
Ships may intentionally ram enemy vessels:
- Ramming occurs when ships occupy the same hex
- Both ships take damage (roll on the Ram column of the Other Damage table)
- Intentional ramming is risky but can be effective against larger ships
- Ships in the same hex may collide accidentally as well

### Landing on Planets
Ships may land on planets with bases:
- The ship must reduce its velocity to match the planet's orbital velocity
- Landing requires being in the same hex as the planet
- Once landed, ships may refuel, repair, and reload cargo
- Planets with bases: Terra (Earth), Venus, Mars, Mercury, Luna, Io, Ganymede, Callisto, Ceres, Clandestine

### Take-Off from Planets
Ships may launch from planetary bases:
- Ships on a planet may launch during the movement phase
- The ship begins with zero velocity (stationary relative to the planet)
- On the first turn after launch, the ship may accelerate normally
- Ships still on a planet may not be attacked (they're protected by planetary defenses)

### Looting Disabled Ships
A disabled ship (one that cannot maneuver or fire) may be looted or captured:
- An enemy ship must match course with the disabled vessel
- During the resupply phase, cargo, fuel, and ordnance may be transferred
- Looting takes one full turn
- Captured ships may be pressed into service or sold
- A disabled ship with no crew may be rescued instead of looted

### Rescue Operations
Ships may rescue crew from disabled friendly vessels:
- Rescue requires matching course with the disabled ship
- Rescue occurs during the resupply phase
- Rescued crew can be transported to safety
- Ships may also rescue crew from lifeboats or escape pods

### Planetary Defenses
Planets with bases have defensive systems:
- Planetary defenses engage enemy ships in orbit
- Defenses have a combat strength equivalent to an orbital base
- Ships landing at or launching from a planet are protected
- Nukes can devastate planetary defenses (takes 20 turns to rebuild)

### Astrogation Hazards

#### Asteroids
The asteroid belt between Mars and Jupiter poses navigation hazards:
- Asteroid hexes provide cover from enemy fire
- Ships moving through asteroid hexes risk collision
- Roll on the Asteroid column of the Other Damage table when passing through
- Asteroids can be mined for resources in campaign play
- Prospecting for valuable ores and minerals is possible with the right equipment

#### Sun
The Sun is an extreme hazard:
- Ships entering a Sun hex are instantly destroyed
- The Sun's gravity well is very strong (multiple hex zones)
- Gravity assist maneuvers near the Sun can provide high speed but are risky
- No ship can survive direct contact with the Sun

#### Contraterrene (CT)
Contraterrene (antimatter) is an extremely rare and valuable substance:
- CT shards are sometimes found in asteroid fields
- Contact with CT causes matter-antimatter annihilation
- Ships carrying CT must have special PM (Polarized Magnetic) Grapples
- CT shards mass 10 tons each
- CT is extremely valuable for sale or advanced propulsion research
- Mishandling CT can destroy a ship instantly

### Fuel Management
- Thrust points are limited per turn
- Must manage fuel for entire mission
- Refueling requires docking
- Running out of fuel leaves ship drifting

## Victory Conditions

Victory is achieved by:
- Destroying all enemy ships (combat)
- Reaching destination first (racing)
- Completing scenario objectives
- Accumulating victory points (campaign)

## Advanced Rules

### MegaCredit Economic System
In campaign games, ships, equipment, and ordnance are purchased with MegaCredits (MCr):
- Players start with an initial budget (scenario-dependent)
- Ships can be purchased at planetary bases
- Cargo runs generate income
- Trade routes provide economic opportunities
- Fuel is either free or costs are tracked per scenario

**Ship Costs (see Ship Types section for full table):**
- Transport: 10 MCr
- Tanker: 10 MCr  
- Liner: 50 MCr
- Packet: 20 MCr
- Corvette: 40 MCr
- Corsair: 80 MCr
- Frigate: 150 MCr
- Dreadnaught: 600 MCr
- Torchship: 400 MCr
- Orbital Base: 1000 MCr

### Detection Rules
For scenarios involving piracy or stealth operations:
- Pirate ships are not "detected" until they enter detection range of a world or ship
- Detection range: 5 hexes for worlds, 3 hexes for ships and bases
- Pirates are also detected when they fire on a target
- Players must roleplay ignoring undetected pirate ships
- Scanners (30 MCr) allow navigation at Clandestine (hidden pirate base)

### Prospecting
Players can mine asteroids for profit:
- Requires Automated Mine equipment (5 MCr, 10 tons)
- Robot Guards (50 MCr, 10 tons) protect mines and ore
- Ore varies in value (1 ton mass each)
- CT (Contraterrene) shards are extremely valuable (10 tons each)
- PM Grapples (40 MCr, 10 tons) required to handle CT shards safely
- Ore can be sold at Ceres or other markets

### Advanced Combat System
This optional system adds tactical detail by tracking three damage types:

**Damage Types:**
1. **Weapon Damage** - Affects ability to fire guns or launch ordnance
2. **Drive Damage** - Affects ability to maneuver
3. **Structure Damage** - General hull integrity

**Damage Roll:** For each hit scored, roll one die:
- 1 = 1 weapon D
- 2 = 1 drive D  
- 3 = 1 structure D
- 4 = 1 weapon D + 1 structure D
- 5 = 1 weapon D + 1 drive D
- 6 = 1 structure D + 1 drive D

**Effects:**
- **Weapon Damage:** Ship cannot fire guns or drop ordnance (except Dreadnaughts can fire at D1-D3)
- **Drive Damage:** Ship cannot maneuver; at D6+ ship is lost when it reaches map edge
- **Structure Damage:** No immediate effect, but at D6+ ship explodes or falls apart
- Ships recover 1 D per turn (owner chooses which type)
- Ships at a base are immediately restored to full operational status
- A ship is lootable/capturable only if it can neither maneuver nor fire

### Ship Customization
- Allocate points among systems
- Trade-offs between speed, armor, and weapons
- Specialized ships for different roles

### Crew Quality
- Experienced crews have bonuses
- Crew can be injured in combat
- Training improves performance

### Orbital Bases Variant
This optional rule adds orbital facilities above each planetary base:
- Any ship that could refuel at a planetary base may now refuel by passing over it while in orbit
- Cargo can be delivered to orbit (ship doesn't land, just enters orbit hex)
- This saves fuel and time compared to landing
- If the planetary base is devastated by a nuke, orbital facilities are lost
- **Advanced Option:** Orbital facilities may be represented by orbital base counters (not destroyed by nukes hitting planet, engage in combat normally)

### Electronic Warfare
- Jamming enemy sensors
- Detecting hidden ships
- Missile countermeasures

## Designer Notes

The vector movement system is the heart of Triplanetary. Unlike traditional board games where pieces simply move from space to space, ships in Triplanetary must plan several turns ahead. A ship accelerating to chase an enemy must later use thrust to slow down or risk flying past the target.

Gravity adds another layer of complexity and strategy. Skilled players can use planetary gravity to conserve fuel or set up surprise attacks by "falling" toward an opponent.

## Quick Reference

### Turn Sequence Summary
1. Astrogation Phase: Plot predicted courses and declare thrust modifications
2. Ordnance Phase: Launch mines/torpedoes/nukes
3. Movement Phase: Move ships and ordnance, apply gravity
4. Combat Phase: Fire weapons and apply damage
5. Resupply Phase: Refuel, transfer cargo, loot ships, recover 1 D damage

### Movement Summary
- Plot velocity arrow from current position
- Spend thrust to modify (1 point = 1 hex shift)
- Move ship to arrow endpoint
- Arrow becomes next turn's velocity

### Combat Summary
- Adjacent ships can fire
- Roll to hit based on modifiers
- Apply damage to hull points
- Ship destroyed at 0 hull points

### Gravity Summary
- Planets pull ships toward them
- Effect increases closer to planet
- Can orbit if velocity is correct
- Use for fuel-free acceleration

## Resources and Credits

These rules are based on the 1973 Game Designers' Workshop edition of Triplanetary, designed by Game Designers' Workshop. The game has been reprinted and revised multiple times, with some variations in rules between editions.

For tournament play or competitive scenarios, consult the official rulebook for your edition.

## Rule Clarifications

### Simultaneous Movement
All ships move at the same time during the movement phase, which can lead to interesting tactical situations where ships pass through each other's hexes.

### Vector Limits
Some editions limit the maximum velocity a ship can achieve. Check your specific scenario or campaign rules.

### Damage Control
In extended campaigns, damaged systems can be repaired between missions or during maintenance phases.

---

*Note: These rules represent a summary and interpretation of the original Triplanetary game. For official tournament play, refer to the published rulebooks. Rule variations may exist between different editions (1973 original, 1981 revision, and 2019 reprint).*
