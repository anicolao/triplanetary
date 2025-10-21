# Triplanetary

A web-based implementation of the classic 1973 science fiction board game **Triplanetary** by Game Designers' Workshop (GDW).

## About the Game

Triplanetary is a tactical space combat game set in the inner solar system. Players command spaceships navigating through a hexagonal map featuring realistic orbital mechanics and Newtonian physics. Ships accumulate velocity and must carefully plan their movements, as momentum carries over from turn to turn.

The game is notable for its realistic physics simulation, where ships don't simply move from hex to hex, but maintain velocity vectors that affect their trajectory. This creates strategic depth as players must plan several moves ahead, managing fuel consumption and positioning for combat or racing scenarios.

## Project Goals

This project aims to bring the classic Triplanetary experience to the web, making it accessible to a new generation of players while preserving the strategic depth and unique physics-based gameplay of the original.

### Features (Planned)

- **Hexagonal game board** representing the inner solar system (Mercury, Venus, Earth, Mars orbits)
- **Realistic Newtonian physics** for ship movement
- **Turn-based gameplay** with movement planning
- **Multiplayer support** on shared touchscreen tabletop device
- **Single-player scenarios** from the original game
- **Campaign mode** with linked scenarios
- **Ship customization** and fleet management
- **Interactive tutorial** to learn the movement system

## Technology Stack

- **TypeScript** for type-safe game logic and rendering
- **HTML5 Canvas** for the entire game interface (minimal HTML/CSS)

## Game Modes

### Racing
Navigate through checkpoint gates using gravity and momentum to reach your destination first.

### Combat
Engage enemy ships in tactical space battles, managing weapons, shields, and maneuvering.

### Scenarios
Play through historical scenarios from the original game, including mining operations, piracy, and military campaigns.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/anicolao/triplanetary.git
cd triplanetary
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Testing

Run unit tests:
```bash
npm test
```

Run end-to-end tests (requires Playwright browsers):
```bash
npx playwright install chromium
npm run test:e2e
```

## Current Features

### Game Configuration Screen

The initial implementation includes a fully functional game configuration screen:

- **Add Players**: Click "Add Player" to add up to 6 players
- **Remove Players**: Click the × button to remove any player
- **Change Colors**: Click on a player's color swatch to open the color picker
- **Color-Blind Friendly**: Uses a scientifically validated palette of 6 colors
- **Start Game**: Begin gameplay once at least one player is configured

All UI is rendered on HTML5 Canvas using TypeScript with Redux state management.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Legal Notice

Triplanetary is a trademark of Game Designers' Workshop. This is a fan project and is not affiliated with or endorsed by the original publishers. This implementation is created for educational and entertainment purposes.

## References

- Original game designed by Game Designers' Workshop (1973)
- See [RULES.md](RULES.md) for detailed game rules

## Acknowledgments

Special thanks to the original designers and the board gaming community that has kept the spirit of Triplanetary alive through the decades.
