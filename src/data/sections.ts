import type { ModuleSection } from "./content";

/**
 * Generic rich-section builder so EVERY module gets a GeeksforGeeks-style
 * walkthrough even when we haven't hand-written sections for it.
 * Hand-curated overrides live in MODULE_SECTIONS below.
 */
export function buildGenericSections(title: string, track: string, blurb: string): ModuleSection[] {
  return [
    {
      id: "intro",
      heading: `Introduction to ${title}`,
      body: `${blurb} In this module we go from intuition to working code, then practice with monitored MCQs and a coding assignment.`,
      bullets: [
        `Why ${title} matters in real ${track.toLowerCase()} systems`,
        "Common interview framings and what they really test",
        "How to recognize when this technique is the right tool",
      ],
    },
    {
      id: "concepts",
      heading: "Core Concepts",
      body: `The vocabulary you need before reading any ${title} solution. Skim once, return when something feels off in the examples.`,
      bullets: [
        "Time and space complexity in plain English",
        "Edge cases that always get tested",
        "Idiomatic patterns vs. brute force",
      ],
    },
    {
      id: "syntax",
      heading: "Syntax Cheatsheet",
      body: "The minimal code you need to express the idea in a few popular languages.",
      code: [
        { language: "javascript", snippet: `// ${title} — JS skeleton\nfunction solve(input) {\n  // TODO: implement\n  return input;\n}` },
        { language: "python", snippet: `# ${title} — Python skeleton\ndef solve(input):\n    # TODO: implement\n    return input` },
      ],
    },
    {
      id: "examples",
      heading: "Worked Examples",
      body: "Two examples — one easy, one slightly tricky — annotated step by step.",
      code: [
        {
          language: "javascript",
          snippet: `// Example 1\nconst input = [1, 2, 3, 4];\nconsole.log(solve(input));\n// Expected: see lesson notes above`,
        },
      ],
    },
    {
      id: "pitfalls",
      heading: "Common Pitfalls",
      body: "Things that quietly break otherwise-correct code.",
      bullets: [
        "Off-by-one mistakes at array boundaries",
        "Mutating inputs you were supposed to leave alone",
        "Picking a complexity class that's too slow for the constraints",
      ],
    },
    {
      id: "practice",
      heading: "Practice Problems",
      body: "Once you can read every example above without a hint, you're ready for the MCQ test and assignment.",
    },
  ];
}

/**
 * Hand-curated sections for a few flagship modules.
 * Anything not listed here uses buildGenericSections() automatically.
 */
export const MODULE_SECTIONS: Record<string, ModuleSection[]> = {
  arrays: [
    {
      id: "intro",
      heading: "What is an Array?",
      body:
        "An array is a contiguous block of memory holding elements of the same type. Because every cell sits next to the previous one, the CPU can jump straight to position i with a single multiplication — that's how access is O(1). The trade-off: inserting in the middle forces every element to the right to shuffle over, which costs O(n).",
      bullets: [
        "Random access in O(1) — the killer feature",
        "Cache-friendly: contiguous memory loves the CPU",
        "Bad at middle insertions and deletions",
      ],
    },
    {
      id: "concepts",
      heading: "Mental Model",
      body:
        "Picture a row of identically-sized lockers numbered 0..n-1. The address of locker i is base + i × cellSize. Everything else (length, bounds checking, dynamic resizing) is a convenience built on top.",
      bullets: [
        "Index ↔ memory offset is the foundation",
        "Length is metadata — not part of the data itself",
        "Dynamic arrays double in size to keep amortised O(1) push",
      ],
    },
    {
      id: "syntax",
      heading: "Syntax in Three Languages",
      body: "The same idea, three flavours.",
      code: [
        { language: "javascript", snippet: `const arr = [3, 1, 4, 1, 5, 9, 2, 6];\narr.push(10);          // append\narr.splice(2, 0, 99);  // insert at index 2\nconsole.log(arr[0]);   // 3` },
        { language: "python", snippet: `arr = [3, 1, 4, 1, 5, 9, 2, 6]\narr.append(10)         # append\narr.insert(2, 99)      # insert at index 2\nprint(arr[0])          # 3` },
        { language: "cpp", snippet: `#include <vector>\nstd::vector<int> arr = {3,1,4,1,5,9,2,6};\narr.push_back(10);\narr.insert(arr.begin()+2, 99);\nstd::cout << arr[0];` },
      ],
    },
    {
      id: "two-pointers",
      heading: "Two-Pointer Technique",
      body:
        "Two indices walk through the array — sometimes from opposite ends, sometimes one chasing the other. Many problems that look quadratic collapse to linear with this trick.",
      code: [
        {
          language: "javascript",
          snippet: `// Reverse an array in O(n) time, O(1) extra space\nfunction reverse(a) {\n  let i = 0, j = a.length - 1;\n  while (i < j) {\n    [a[i], a[j]] = [a[j], a[i]];\n    i++; j--;\n  }\n  return a;\n}`,
        },
      ],
    },
    {
      id: "prefix-sums",
      heading: "Prefix Sums",
      body:
        "Precompute cumulative sums so that any range sum becomes a single subtraction. Foundational for many subarray problems.",
      code: [
        {
          language: "javascript",
          snippet: `function buildPrefix(a) {\n  const p = [0];\n  for (let i = 0; i < a.length; i++) p.push(p[i] + a[i]);\n  return p;\n}\n\nfunction rangeSum(p, l, r) {\n  return p[r + 1] - p[l]; // inclusive\n}`,
        },
      ],
    },
    {
      id: "pitfalls",
      heading: "Pitfalls",
      body: "What trips people up.",
      bullets: [
        "Using splice() inside a hot loop — it's O(n) every call",
        "Off-by-one on inclusive vs. exclusive bounds",
        "Forgetting that JS arrays are sparse and may have holes",
      ],
    },
    {
      id: "practice",
      heading: "Ready for the test?",
      body: "Take the 30-MCQ practice. If you score 24+, the assignment will feel natural.",
    },
  ],

  javascript: [
    {
      id: "intro",
      heading: "JavaScript, the Runtime",
      body:
        "JavaScript runs in a single thread on a runtime (V8 in Chrome and Node). It's non-blocking thanks to an event loop that interleaves macrotasks (setTimeout, I/O) with microtasks (Promises).",
    },
    {
      id: "event-loop",
      heading: "The Event Loop",
      body: "Microtasks drain completely between macrotasks. That's why a Promise resolves before the next setTimeout(0).",
      code: [
        { language: "javascript", snippet: `console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");\n// A D C B` },
      ],
    },
    {
      id: "closures",
      heading: "Closures",
      body: "A function 'closes over' the variables it referenced when it was created. This is how private state and currying work.",
      code: [
        { language: "javascript", snippet: `function counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst c = counter();\nc(); c(); c(); // 3` },
      ],
    },
    {
      id: "async",
      heading: "Async / Await",
      body: "Syntactic sugar over Promises. Lets you write asynchronous code that reads top-to-bottom.",
      code: [
        { language: "javascript", snippet: `async function getUser(id) {\n  const res = await fetch(\`/api/users/\${id}\`);\n  if (!res.ok) throw new Error("not found");\n  return res.json();\n}` },
      ],
    },
    {
      id: "pitfalls",
      heading: "Pitfalls",
      body: "What burns beginners.",
      bullets: [
        "== vs. === — always prefer ===",
        "this binding inside callbacks (use arrow functions)",
        "Forgetting await on an async call (silent bugs)",
      ],
    },
  ],
};
