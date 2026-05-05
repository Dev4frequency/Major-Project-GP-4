export type Module = {
  id: string;
  track: string;
  title: string;
  blurb: string;
  lessons: { heading: string; body: string; example?: string }[];
};

export const MODULES: Module[] = [
  {
    id: "arrays",
    track: "DSA",
    title: "Arrays",
    blurb: "Master contiguous memory, traversal, and the two-pointer technique.",
    lessons: [
      {
        heading: "What is an Array?",
        body: "An array stores elements of the same type in contiguous memory. Random access in O(1), but insertions/deletions in the middle cost O(n).",
        example: "[3, 1, 4, 1, 5, 9, 2, 6]",
      },
      {
        heading: "Two Pointers",
        body: "Use two indices that move toward each other (or in the same direction) to solve problems like reversing, pair-sum, and partitioning in linear time.",
      },
      {
        heading: "Prefix Sums",
        body: "Precompute cumulative sums so any range query becomes O(1). Foundational for many subarray problems.",
      },
    ],
  },
  {
    id: "sorting",
    track: "DSA",
    title: "Sorting",
    blurb: "Compare-based sorting, stability, and when each algorithm shines.",
    lessons: [
      { heading: "Comparison Sorts", body: "Merge sort and quicksort dominate practice. Merge sort is O(n log n) worst-case and stable. Quicksort is in-place and cache-friendly." },
      { heading: "Stability", body: "A sort is stable if equal keys keep their original relative order — critical when sorting by multiple fields." },
    ],
  },
  {
    id: "searching",
    track: "DSA",
    title: "Searching",
    blurb: "Binary search and its many disguises in monotonic problems.",
    lessons: [
      { heading: "Binary Search", body: "On a sorted array, halve the search space each step → O(log n). The trick is recognizing the monotonic predicate." },
      { heading: "Search on Answer", body: "Binary search the answer when the predicate 'is X feasible?' is monotonic in X." },
    ],
  },
  {
    id: "recursion",
    track: "DSA",
    title: "Recursion",
    blurb: "Think in subproblems. Build the foundation for DP and backtracking.",
    lessons: [
      { heading: "Base + Recursive Case", body: "Every recursion needs a terminating base case and a step that reduces the problem size." },
      { heading: "Call Stack", body: "Each call uses stack space. Deep recursion can overflow — convert to iteration or use tail-style patterns." },
    ],
  },
  {
    id: "linked-lists",
    track: "DSA",
    title: "Linked Lists",
    blurb: "Pointers, dummy nodes, and the classic fast/slow pattern.",
    lessons: [
      { heading: "Singly vs Doubly", body: "Singly lists move one direction; doubly allow O(1) deletion given a node." },
      { heading: "Floyd's Cycle Detection", body: "Two pointers, one moving twice as fast — detect a cycle in O(n) time and O(1) space." },
    ],
  },
  {
    id: "graphs",
    track: "DSA",
    title: "Graphs",
    blurb: "BFS, DFS, and modeling real-world relationships as nodes & edges.",
    lessons: [
      { heading: "BFS", body: "Explores by layers using a queue. Finds shortest path on unweighted graphs." },
      { heading: "DFS", body: "Goes deep first using recursion or a stack. Powers cycle detection, topological sort, and connectivity." },
    ],
  },
];

export const TRACKS = ["DSA", "System Design", "Web"];

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
