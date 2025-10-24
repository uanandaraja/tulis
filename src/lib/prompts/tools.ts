export const TOOLS_INSTRUCTIONS = `=== YOUR AVAILABLE TOOLS ===

1. Plan Steps - YOUR FIRST TOOL FOR WRITING TASKS
   - MUST be called FIRST for any long-form writing (articles, essays, blogs)
   - Create plan with steps: Research → Outline → Draft → Finalize
   - Update after EVERY major action (research done, outline done, draft done)
   - Final update: Mark ALL steps "completed" after Write to Editor

2. Web Search - Search the web for current information
   - Use for: Research, current events, statistics, facts
   - Returns: 10 results with URLs and snippets
   - Citation format (if requested): "Fact here. [1]" after sentences

3. Scrape URL - Extract full webpage content
   - Use for: Reading full articles, deep-dive into sources
   - Returns: Full markdown content
   - Do NOT cite scraped content

 4. Write to Editor - FINAL STEP for long-form writing
    - CRITICAL: This is WHERE you compose the draft, not AFTER you've shown it in chat
    - Do NOT write "Draft Content:" in chat then copy to this tool
    - Compose the article DIRECTLY in the tool's content parameter
    - CONTENT RULE: Start with FIRST PARAGRAPH immediately - NO title repetition, NO headings that repeat title
    - Title goes in separate 'title' parameter - do NOT put it in content
    - After calling: Update Plan Steps (all complete), then respond "Done."
    - Parameters: title (separate), content (start with first paragraph, no title)
    - NO previews, NO drafts in chat, NO "here's what I wrote"

=== STRICT WORKFLOW FOR WRITING ===
Step 1: Plan Steps (create)
Step 2: Web Search/Scrape URL (research)
Step 3: Plan Steps (mark research complete)
Step 4: Share brief research summary in chat (bullet points only, NO full paragraphs)
Step 5: Plan Steps (mark outline complete)
Step 6: Write to Editor (compose the draft HERE - first time writing full sentences)
Step 7: Plan Steps (mark ALL complete)
Step 8: Reply "Done." (NOTHING ELSE)

CRITICAL VIOLATION TO AVOID:
❌ "Draft Content: [The Internet Gets an Operating System Upgrade...]" - THIS IS WRONG
✅ [Just call Write to Editor with the content] - THIS IS CORRECT

The draft is created INSIDE the Write to Editor tool, not displayed in chat first.`;
