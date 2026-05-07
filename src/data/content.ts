export type ModuleSection = {
  id: string;
  heading: string;
  body: string;
  bullets?: string[];
  code?: { language: string; snippet: string }[];
};

export type Module = {
  id: string;
  track: string;
  title: string;
  blurb: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: { heading: string; body: string; example?: string }[];
  sections?: ModuleSection[];
};

export const TRACKS = ["DSA", "System Design", "Web", "Databases", "DevOps"];

export const MODULES: Module[] = [
  {
    id: "arrays", track: "DSA", title: "Arrays", level: "Beginner", duration: "30 min",
    blurb: "Master contiguous memory, traversal, and the two-pointer technique.",
    lessons: [
      { heading: "What is an Array?", body: "An array stores elements of the same type in contiguous memory. Random access in O(1), insertions/deletions in the middle cost O(n).", example: "[3, 1, 4, 1, 5, 9, 2, 6]" },
      { heading: "Two Pointers", body: "Two indices that move toward each other (or together) solve reversing, pair-sum, and partitioning in linear time." },
      { heading: "Prefix Sums", body: "Precompute cumulative sums so any range query becomes O(1). Foundational for many subarray problems." },
    ],
  },
  {
    id: "strings", track: "DSA", title: "Strings", level: "Beginner", duration: "35 min",
    blurb: "Pattern matching, sliding windows, and the anatomy of substrings.",
    lessons: [
      { heading: "Immutability", body: "In most languages strings are immutable — every concatenation builds a new string. Use builders for hot loops." },
      { heading: "Sliding Window", body: "A window of fixed or variable size slides across the string maintaining an invariant — perfect for substring problems." },
      { heading: "KMP Intuition", body: "Knuth–Morris–Pratt avoids re-scanning by precomputing the longest proper prefix that is also a suffix." },
    ],
  },
  {
    id: "sorting", track: "DSA", title: "Sorting", level: "Beginner", duration: "40 min",
    blurb: "Compare-based sorting, stability, and when each algorithm shines.",
    lessons: [
      { heading: "Comparison Sorts", body: "Merge sort and quicksort dominate practice. Merge sort is O(n log n) worst-case and stable. Quicksort is in-place and cache-friendly." },
      { heading: "Stability", body: "A sort is stable if equal keys keep their original relative order — critical when sorting by multiple fields." },
    ],
  },
  {
    id: "searching", track: "DSA", title: "Searching", level: "Beginner", duration: "30 min",
    blurb: "Binary search and its many disguises in monotonic problems.",
    lessons: [
      { heading: "Binary Search", body: "On a sorted array, halve the search space each step → O(log n). The trick is recognizing the monotonic predicate." },
      { heading: "Search on Answer", body: "Binary-search the answer when 'is X feasible?' is monotonic in X." },
    ],
  },
  {
    id: "recursion", track: "DSA", title: "Recursion", level: "Intermediate", duration: "45 min",
    blurb: "Think in subproblems. Build the foundation for DP and backtracking.",
    lessons: [
      { heading: "Base + Recursive Case", body: "Every recursion needs a terminating base case and a step that reduces problem size." },
      { heading: "Call Stack", body: "Each call uses stack space. Deep recursion can overflow — convert to iteration or use tail-style patterns." },
    ],
  },
  {
    id: "linked-lists", track: "DSA", title: "Linked Lists", level: "Beginner", duration: "35 min",
    blurb: "Pointers, dummy nodes, and the classic fast/slow pattern.",
    lessons: [
      { heading: "Singly vs Doubly", body: "Singly lists move one direction; doubly allow O(1) deletion given a node." },
      { heading: "Floyd's Cycle Detection", body: "Two pointers, one twice as fast — detect a cycle in O(n) time, O(1) space." },
    ],
  },
  {
    id: "stacks-queues", track: "DSA", title: "Stacks & Queues", level: "Beginner", duration: "30 min",
    blurb: "LIFO and FIFO — the two most useful linear structures.",
    lessons: [
      { heading: "Stack", body: "Last-in, first-out. Powers expression parsing, undo systems, and DFS." },
      { heading: "Queue", body: "First-in, first-out. Powers BFS, scheduling, and rate limiters." },
      { heading: "Monotonic Stack", body: "Maintain a stack with monotonic order to find next-greater/smaller in O(n)." },
    ],
  },
  {
    id: "trees", track: "DSA", title: "Trees", level: "Intermediate", duration: "50 min",
    blurb: "Hierarchies, traversals, and the path to balanced search structures.",
    lessons: [
      { heading: "Binary Trees", body: "Each node has up to two children. Traversals: pre/in/post-order and level-order." },
      { heading: "BST", body: "Left subtree < node < right subtree. Average O(log n) operations when balanced." },
    ],
  },
  {
    id: "graphs", track: "DSA", title: "Graphs", level: "Intermediate", duration: "55 min",
    blurb: "BFS, DFS, and modeling real-world relationships as nodes & edges.",
    lessons: [
      { heading: "BFS", body: "Explores by layers using a queue. Finds shortest path on unweighted graphs." },
      { heading: "DFS", body: "Goes deep first using recursion or a stack. Powers cycle detection, topological sort, connectivity." },
    ],
  },
  {
    id: "dp", track: "DSA", title: "Dynamic Programming", level: "Advanced", duration: "70 min",
    blurb: "Identify overlapping subproblems and remember answers, not work.",
    lessons: [
      { heading: "Memoization vs Tabulation", body: "Top-down caches recursive answers; bottom-up fills a table iteratively." },
      { heading: "State Design", body: "The hardest part of DP is choosing the state. Ask: what minimal info do I need to compute the next answer?" },
    ],
  },
  {
    id: "greedy", track: "DSA", title: "Greedy Algorithms", level: "Intermediate", duration: "40 min",
    blurb: "When local optima compose into a global optimum.",
    lessons: [
      { heading: "Exchange Argument", body: "Prove greedy correctness by showing any deviation can be swapped without loss." },
      { heading: "Common Patterns", body: "Interval scheduling, Huffman coding, and Dijkstra — all greedy at heart." },
    ],
  },
  {
    id: "hashing", track: "DSA", title: "Hashing", level: "Beginner", duration: "30 min",
    blurb: "Average O(1) lookups — and the collisions that complicate them.",
    lessons: [
      { heading: "Hash Maps", body: "Map keys to buckets with a hash function. Resize when load factor grows." },
      { heading: "Collisions", body: "Resolve with chaining or open addressing. Bad hashes turn O(1) into O(n)." },
    ],
  },
  {
    id: "system-basics", track: "System Design", title: "System Design Foundations", level: "Beginner", duration: "60 min",
    blurb: "Latency, throughput, and the language of distributed systems.",
    lessons: [
      { heading: "Latency vs Throughput", body: "Latency is per-request; throughput is requests per second. Optimize the one your users feel." },
      { heading: "Back-of-the-Envelope", body: "Estimate before designing. 1 server ≈ 10k QPS for a simple JSON API. Memory access ≈ 100ns; SSD ≈ 100µs; network round-trip ≈ 1ms." },
    ],
  },
  {
    id: "caching", track: "System Design", title: "Caching", level: "Intermediate", duration: "40 min",
    blurb: "Speed by memory, complexity by invalidation.",
    lessons: [
      { heading: "Cache Strategies", body: "Cache-aside, write-through, write-back. Each trades consistency for speed differently." },
      { heading: "Eviction", body: "LRU is the default; LFU when access patterns are stable; TTL when freshness matters." },
    ],
  },
  {
    id: "sql-basics", track: "Databases", title: "SQL Fundamentals", level: "Beginner", duration: "45 min",
    blurb: "Relational thinking — schemas, joins, and indexes.",
    lessons: [
      { heading: "Joins", body: "INNER returns matches; LEFT keeps left rows; FULL keeps both. Pick by what you need to preserve." },
      { heading: "Indexes", body: "Indexes speed reads but slow writes. The right index turns a full scan into a B-tree lookup." },
    ],
  },
  {
    id: "nosql", track: "Databases", title: "NoSQL & Document Stores", level: "Intermediate", duration: "40 min",
    blurb: "When schemas hurt and aggregates win.",
    lessons: [
      { heading: "When NoSQL", body: "Pick document/key-value when access patterns are known and joins are rare." },
      { heading: "Eventual Consistency", body: "Reads may lag writes. Design UX for it (optimistic UI, retries)." },
    ],
  },
  {
    id: "html-css", track: "Web", title: "HTML & CSS", level: "Beginner", duration: "50 min",
    blurb: "Semantics, the box model, and modern layout.",
    lessons: [
      { heading: "Semantic HTML", body: "Use <article>, <nav>, <main>, <header>. The browser, screen readers, and SEO all reward it." },
      { heading: "Flexbox & Grid", body: "Flexbox lays out one dimension at a time. Grid lays out two. Reach for Grid when rows AND columns matter." },
    ],
  },
  {
    id: "javascript", track: "Web", title: "JavaScript Essentials", level: "Beginner", duration: "60 min",
    blurb: "The runtime, the event loop, and async you can trust.",
    lessons: [
      { heading: "Event Loop", body: "JS is single-threaded but non-blocking. The loop dequeues macrotasks and microtasks (promises)." },
      { heading: "Closures", body: "A function 'closes over' the variables it referenced. Powers private state and currying." },
    ],
  },
  {
    id: "react", track: "Web", title: "React Fundamentals", level: "Intermediate", duration: "55 min",
    blurb: "Components, state, and the rules that keep renders predictable.",
    lessons: [
      { heading: "Components & Props", body: "Components are pure functions of their props. Same input → same output." },
      { heading: "Hooks", body: "useState for local state, useEffect for synchronization with the outside world. Keep effects pure." },
    ],
  },
  {
    id: "rest-api", track: "Web", title: "REST APIs", level: "Beginner", duration: "35 min",
    blurb: "Resources, verbs, and the contracts that make services usable.",
    lessons: [
      { heading: "Verbs", body: "GET reads, POST creates, PUT replaces, PATCH updates, DELETE removes. Status codes matter." },
      { heading: "Idempotency", body: "Safe to retry without side effects. GET and PUT are idempotent; POST is not." },
    ],
  },
  {
    id: "git", track: "DevOps", title: "Git & Version Control", level: "Beginner", duration: "30 min",
    blurb: "Snapshots, branches, and the discipline of small commits.",
    lessons: [
      { heading: "Commits & Branches", body: "A commit is a snapshot. A branch is a pointer to a commit. Merging combines histories." },
      { heading: "Rebase vs Merge", body: "Merge preserves history; rebase rewrites it for a linear log. Never rebase shared branches." },
    ],
  },
  {
    id: "docker", track: "DevOps", title: "Containers with Docker", level: "Intermediate", duration: "45 min",
    blurb: "Reproducible environments from one Dockerfile.",
    lessons: [
      { heading: "Images & Containers", body: "An image is a read-only template. A container is a running instance with a writable layer." },
      { heading: "Layers & Caching", body: "Order Dockerfile instructions so frequently-changing layers come last — caching speeds rebuilds." },
    ],
  },
  {
    id: "ci-cd", track: "DevOps", title: "CI/CD", level: "Intermediate", duration: "40 min",
    blurb: "Automate the path from commit to production.",
    lessons: [
      { heading: "Pipelines", body: "Lint → test → build → deploy. Fail fast; the earlier a stage catches a bug, the cheaper the fix." },
      { heading: "Trunk-Based Development", body: "Short-lived branches and frequent merges keep integration cheap." },
    ],
  },
];

export const MCQS = [
  { q: "Time complexity to access an array element by index?", opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], a: 0 },
  { q: "Which is stable?", opts: ["Quicksort", "Heapsort", "Merge sort", "Selection sort"], a: 2 },
  { q: "Binary search requires the array to be...", opts: ["Hashed", "Sorted", "Linked", "Balanced"], a: 1 },
  { q: "Best case of insertion sort?", opts: ["O(1)", "O(n)", "O(n log n)", "O(n^2)"], a: 1 },
  { q: "DFS uses which data structure?", opts: ["Queue", "Stack", "Heap", "Set"], a: 1 },
  { q: "BFS finds shortest path on...", opts: ["Weighted graph", "Unweighted graph", "DAG only", "Trees only"], a: 1 },
  { q: "Hash table average lookup?", opts: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], a: 0 },
  { q: "Which is NOT divide & conquer?", opts: ["Merge sort", "Quick sort", "Binary search", "Bubble sort"], a: 3 },
  { q: "Two-pointer technique is most useful on...", opts: ["Hash maps", "Sorted arrays", "Trees", "Graphs"], a: 1 },
  { q: "Recursion uses which memory area?", opts: ["Heap", "Stack", "BSS", "Data"], a: 1 },
  { q: "Average quicksort complexity?", opts: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], a: 1 },
  { q: "Which detects a linked list cycle in O(1) space?", opts: ["Hash set", "Floyd's algorithm", "Recursion", "Sorting"], a: 1 },
  { q: "Prefix sum allows range sum query in...", opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], a: 0 },
  { q: "A balanced BST search is...", opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], a: 1 },
  { q: "Big-O ignores...", opts: ["Constants", "Variables", "Inputs", "Memory"], a: 0 },
  { q: "Stack follows...", opts: ["FIFO", "LIFO", "Random", "Priority"], a: 1 },
  { q: "Queue follows...", opts: ["FIFO", "LIFO", "Random", "Priority"], a: 0 },
  { q: "Heap is typically implemented with...", opts: ["Linked list", "Array", "Tree of pointers", "Hash map"], a: 1 },
  { q: "Dijkstra's algorithm fails with...", opts: ["Negative weights", "Cycles", "Self-loops", "Large graphs"], a: 0 },
  { q: "Topological sort exists only for...", opts: ["Trees", "DAGs", "Cyclic graphs", "Undirected graphs"], a: 1 },
  { q: "Union-Find is used for...", opts: ["Sorting", "Connectivity", "Searching", "Hashing"], a: 1 },
  { q: "Memoization is a form of...", opts: ["Greedy", "DP", "Backtracking", "Brute force"], a: 1 },
  { q: "Greedy works when problem has...", opts: ["Overlapping subproblems", "Optimal substructure & greedy choice", "Cycles", "Negative weights"], a: 1 },
  { q: "A trie is best for...", opts: ["Range sums", "Prefix queries", "Sorting", "Cycles"], a: 1 },
  { q: "Sliding window applies to...", opts: ["Subsequences", "Contiguous subarrays", "Random sets", "Trees"], a: 1 },
  { q: "Bit manipulation `x & (x-1)` clears...", opts: ["All bits", "Lowest set bit", "Highest set bit", "Sign bit"], a: 1 },
  { q: "Which sort is in-place?", opts: ["Merge sort", "Quick sort", "Counting sort", "Radix sort"], a: 1 },
  { q: "Lower bound for comparison sort?", opts: ["O(n)", "O(n log n)", "O(log n)", "O(n^2)"], a: 1 },
  { q: "An adjacency list uses space...", opts: ["O(V)", "O(E)", "O(V+E)", "O(V^2)"], a: 2 },
  { q: "Which traversal visits root first?", opts: ["Inorder", "Preorder", "Postorder", "Level-order"], a: 1 },
];

export const ASSIGNMENTS = [
  {
    id: "two-sum",
    title: "Two Sum",
    description:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution, and you may not use the same element twice.",
    sample: { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
  },
  {
    id: "valid-parens",
    title: "Valid Parentheses",
    description:
      "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Brackets must close in the correct order and each opening bracket must have a matching close.",
    sample: { input: 's = "()[]{}"', output: "true" },
  },
];
