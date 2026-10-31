import { DocumentData } from "@/types/document";

export const INITIAL_DOCUMENTS: DocumentData[] = [
  {
    id: "getting-started",
    title: "Welcome to SoulDocs",
    icon: "✨",
    isFavorite: true,
    createdAt: 1730360000000,
    updatedAt: 1730361200000,
    content: `
      <h2>⚡ Offline-First Collaborative Document Editor</h2>
      <p>SoulDocs is built from the ground up for resilient local editing, peer-to-peer real-time synchronization, and local cryptographic privacy.</p>
      
      <blockquote>
        <p><strong>Offline First:</strong> Your documents exist on your device first. You can write, format, and organize without a network connection, and changes sync effortlessly when reconnecting.</p>
      </blockquote>

      <h3>Key Features</h3>
      <ul>
        <li><strong>Local-first persistence:</strong> Instant loading and zero latency typing.</li>
        <li><strong>Rich formatting:</strong> Headings, styled lists, inline code blocks, and quotes.</li>
        <li><strong>Network resilience:</strong> Real-time network and local cache status indicators.</li>
        <li><strong>P2P ready:</strong> Modular architecture ready for Yjs and WebRTC integration.</li>
      </ul>

      <h3>Formatting Shortcuts</h3>
      <p>Try using the formatting toolbar above or standard markdown shortcuts:</p>
      <ul>
        <li><code># </code> + Space for Heading 1</li>
        <li><code>## </code> + Space for Heading 2</li>
        <li><code>- </code> or <code>* </code> + Space for Bullet Lists</li>
        <li><code>1. </code> + Space for Numbered Lists</li>
        <li><code>&gt; </code> + Space for Blockquotes</li>
      </ul>

      <p>Start editing this document or click <strong>New Document</strong> in the sidebar to create a fresh workspace!</p>
    `,
  },
  {
    id: "architecture-notes",
    title: "SoulDocs Architecture & Design",
    icon: "🧠",
    isFavorite: true,
    createdAt: 1730355000000,
    updatedAt: 1730358000000,
    content: `
      <h2>Modular System Architecture</h2>
      <p>SoulDocs follows a strict separation of concerns to enable seamless scaling from offline single-user editing to encrypted multi-peer collaboration.</p>

      <h3>Core Stack</h3>
      <ul>
        <li><strong>Presentation:</strong> Next.js App Router (Client Components for rich browser interaction)</li>
        <li><strong>UI & Styling:</strong> Tailwind CSS v4 & shadcn/ui components</li>
        <li><strong>Editor Core:</strong> TipTap (ProseMirror foundation)</li>
        <li><strong>Conflict-free CRDT:</strong> Yjs state layer (prepared for Phase 2)</li>
        <li><strong>Persistence:</strong> IndexedDB / Dexie.js for persistent local documents</li>
      </ul>

      <blockquote>
        <p><em>"Prioritize working functionality over complexity. Build incrementally."</em> — SoulDocs Core Rule</p>
      </blockquote>
    `,
  },
  {
    id: "hackathon-plan",
    title: "24-Hour Hackathon Roadmap",
    icon: "🚀",
    isFavorite: false,
    createdAt: 1730350000000,
    updatedAt: 1730352000000,
    content: `
      <h2>Roadmap Milestones</h2>
      <ol>
        <li><strong>Milestone 1:</strong> Core Editor & Notion-style UI with status indicators (Current)</li>
        <li><strong>Milestone 2:</strong> Offline persistence with IndexedDB / Dexie.js</li>
        <li><strong>Milestone 3:</strong> Yjs CRDT binding & undo/redo tracking</li>
        <li><strong>Milestone 4:</strong> WebRTC P2P multi-device sync</li>
        <li><strong>Milestone 5:</strong> End-to-end Web Crypto API document encryption</li>
      </ol>
    `,
  },
];
