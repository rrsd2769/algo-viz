# algo**viz** &nbsp;`v3.0`

> An interactive algorithm visualizer built with React and Vite. Step through sorting, graph traversal, pathfinding, and string matching algorithms frame by frame, with real-time metrics and a resizable sidebar.

---

## Features

- **4 visualization modules** accessible via tab navigation
- **Step-by-step playback** with adjustable speed (1x to 10x), frame scrubbing, and replay
- **Real-time stats** per algorithm: comparisons, swaps, elapsed time, progress percentage
- **Resizable and collapsible sidebar** via drag handle
- **Custom input** for arrays (comma-separated) and graphs (adjacency list format)
- **Log panel** with color-coded event labels for every step

---

## Algorithm Coverage

### Sorting
| Algorithm | Time (avg) | Time (worst) | Space |
|---|---|---|---|
| Bubble Sort | O(n²) | O(n²) | O(1) |
| Insertion Sort | O(n²) | O(n²) | O(1) |
| Merge Sort | O(n log n) | O(n log n) | O(n) |
| Quick Sort | O(n log n) | O(n²) | O(log n) |

### Graph Traversal and Pathfinding
| Algorithm | Strategy | Weighted |
|---|---|---|
| BFS | Queue, level-order | No |
| DFS | Recursive, stack-based | No |
| A* | Priority queue, f = g + h | Yes (Euclidean heuristic x 10) |

### String Matching
| Algorithm | Time | Description |
|---|---|---|
| KMP | O(n + m) | Failure function (LPS array) + linear search |

### Comparison Mode
Run any two sorting algorithms side by side on the same array with synchronized playback and per-algorithm metrics.

---

## Project Structure

```
algo-viz/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                      # React entry point
    ├── App.jsx                       # Root layout: sidebar, tabs, main panel
    │
    ├── utils/
    │   └── constants.js              # Event types (EV), colors, icons, tab config
    │
    ├── hooks/
    │   ├── useSortState.js           # Sort playback state, frame generation, stats
    │   ├── useGraphState.js          # Graph construction, algorithm dispatch, playback
    │   └── useKMPState.js            # KMP text/pattern state and playback
    │
    ├── algorithms/
    │   ├── sorting/
    │   │   ├── bubbleSort.js
    │   │   ├── insertionSort.js
    │   │   ├── mergeSort.js
    │   │   └── quickSort.js
    │   ├── graph/
    │   │   └── graphAlgorithms.js    # BFS, DFS, A* event generators
    │   └── string/
    │       └── kmp.js                # LPS construction + KMP search event generator
    │
    └── components/
        ├── shared/
        │   ├── Controls.jsx          # Play/pause/step/speed controls
        │   ├── LogPanel.jsx          # Scrollable event log
        │   ├── ProgressBar.jsx       # Top progress stripe
        │   ├── SectionLabel.jsx      # Sidebar section headers
        │   ├── Sidebar.jsx           # SortSidebar, GraphSidebar, KMPSidebar
        │   └── StatsBox.jsx          # Stats table + AlgoBtn
        ├── sorting/
        │   └── SortingVisualizer.jsx
        ├── graph/
        │   └── GraphVisualizer.jsx
        ├── string/
        │   └── KMPVisualizer.jsx
        └── comparison/
            └── ComparisonMode.jsx
```

---

## Architecture

### Event-Driven Animation Model

Every algorithm generates a flat array of **event objects** before any animation starts. Each event captures a complete snapshot of algorithm state at that step (array contents, visited nodes, queue, parent pointers, etc.). The playback engine walks this array frame by frame.

```
Algorithm function (e.g. bubbleSortEvents)
        |
        v
   events[]  <-- immutable snapshot array
        |
        v
   Hook (useSortState)
   - currentFrame index
   - isPlaying, speed
   - derived stats (comparisons, swaps)
        |
        v
   Visualizer component  <-- reads events[currentFrame] to render
```

This design separates algorithm logic from rendering completely. Algorithms have zero React dependencies; they are plain JavaScript functions that take input and return an event array.

### Event Types (`EV` constants)

Sorting events: `COMPARE`, `SWAP`, `MATCH`, `SORTED`, `PIVOT`, `MERGE_WRITE`

Graph events: `VISIT`, `ENQUEUE`, `EDGE_EXPLORE`, `EDGE_TREE`, `EDGE_BACK`, `PATH_FOUND`, `PATH_TRACE`, `ASTAR_OPEN`, `ASTAR_CURRENT`, `ASTAR_CLOSE`, `ASTAR_RELAX`

KMP events: `KMP_MATCH`, `KMP_MISMATCH`, `KMP_FOUND`, `KMP_SKIP`, `KMP_LPS_COMPUTE`, `KMP_LPS_MATCH`

Each event type maps to a distinct color and icon in `LogPanel` via `EV_COLOR` and `EV_ICON`.

### State Hooks

Each module has its own hook that owns:
- The raw input and the compiled event array (`frames`)
- `currentFrame` cursor and `isPlaying` flag
- A `useEffect`-based interval for auto-play at the selected speed
- Derived display values (progress %, comparisons, swaps, time taken)
- Callbacks exposed to sidebar and controls (`play`, `pause`, `stepForward`, `stepBack`, `reset`, `changeAlgo`, etc.)

### Graph Representation

Graphs are stored as `{ nodes: [{id, label, x, y}], edges: [{from, to, w}], adj: [{to, w}[]][] }`. The custom graph input supports two formats:

```
# Space-separated edge list
A B 4
A E 2
B C 5

# Adjacency list notation
A: B(4), E(2)
B: C(5), F(3)
```

A* uses a Euclidean pixel-distance heuristic scaled by 10 to align with integer edge weights.

---

## Getting Started

### Prerequisites

- Node.js >= 16
- npm >= 7

### Installation

```bash
git clone https://github.com/rrsd2769/algo-viz.git
cd algo-viz
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

Output goes to `dist/`. To preview the production build locally:

```bash
npm run preview
```

### Deploy to GitHub Pages

```bash
npm run build
# then push the dist/ folder to the gh-pages branch, or configure Vite's base in vite.config.js:
# base: '/algo-viz/'
```

---

## Usage Guide

### Sorting Tab

1. Select an algorithm from the sidebar (Bubble, Insertion, Merge, Quick)
2. Drag the array size slider (4 to 80 elements) or enter a custom comma-separated array
3. Press **Play** or use **step buttons** to walk through the animation
4. The stats box tracks comparisons, swaps, and elapsed time live

**Custom array format:** `42, 7, 19, 3, 88` (integers, comma or space separated)

### Graph Tab

1. Select BFS, DFS, or A*
2. Pick start and end nodes from the dropdowns
3. Optionally expand **Custom Graph** to define your own topology
4. Press Play; nodes highlight as visited and the final path traces in sequence

**Custom graph format (edge list):**
```
A B 4
A E 2
B C 5
```
Toggle **Directed** to control edge directionality before clicking **Build**.

### KMP Tab

Enter a text string and a pattern. Phase 1 visualizes LPS array construction; Phase 2 shows the search, highlighting matches, mismatches, and pattern shifts.

### Comparison Tab

Select exactly 2 sorting algorithms. Both run on the same randomly generated array with synchronized playback, letting you compare step counts, comparisons, and swaps side by side.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Language | JavaScript (ES2022) |
| Styling | Inline styles with CSS variables |
| Fonts | JetBrains Mono, Fira Code |
| Deployment | GitHub Pages |

No external component libraries or CSS frameworks are used. All UI elements are purpose-built.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-algorithm`
3. Add your algorithm as a pure event-generator function under `src/algorithms/`
4. Wire up the hook, sidebar entry, and visualizer component
5. Submit a pull request with a short description of the algorithm and its event types

---

## License

MIT
