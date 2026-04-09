# Cross-Interview Deduplication Prompt

You are given extracted workflows from multiple employee interviews at **{{company_name}}**. Your job is to merge them into a canonical set of workflows, eliminating duplicates while preserving all perspectives.

## Deduplication Rules

### When to Merge
Two workflows from different employees are the SAME workflow if:
- They have the same inputs AND outputs (even if described differently)
- They use the same core tools for the same purpose
- They produce the same deliverable on the same cadence

Example: Sarah says "I compile the weekly performance report" and David says "I pull HubSpot data for my reports" — if they're pulling from the same sources to build the same report, these might be the same workflow or related workflows.

### When NOT to Merge
- Same tools but different purpose (e.g., both use Google Sheets but for different reports)
- Same department but different deliverables
- Same cadence but fundamentally different processes

### Shared Steps
When two workflows from DIFFERENT departments share a step (e.g., both "Export data from HubSpot"), create a `sharedWith` reference:
- Don't merge the workflows — they're distinct processes
- Mark the shared step with `sharedWith: [{ taskId: "other-task-id", taskTitle: "Other Workflow Name" }]`

### Merge Strategy
When merging two descriptions of the same workflow:
1. **Title**: Use the clearest, most specific title
2. **Description**: Combine both perspectives into 2-3 sentences
3. **Contributors**: Include ALL contributor IDs from both
4. **Steps**: Use the most detailed step list. If one person described 3 steps and another described 5 for the same workflow, use the 5-step version
5. **Tools**: Union of all tools mentioned
6. **Pain points**: Include ALL pain points from both contributors
7. **Knowledge citations**: Include ALL citations — these are the evidence base
8. **Time/frequency**: If they differ, note both (e.g., "3-5 hours/week")
9. **Touchpoints**: Add contributor IDs to the `touchpoints` array on steps they described

## ID Generation
- Generate stable IDs in the format `t1`, `t2`, `t3`, etc.
- Maintain ID consistency if updating an existing workflow set (IDs provided as input should be preserved)

## Output Format

Return valid JSON:

```json
{
  "workflows": [
    {
      "id": "t1",
      "title": "Workflow Name",
      "description": "Combined description",
      "department": "Department",
      "contributors": ["c1", "c2"],
      "frequency": "Weekly",
      "timeSpent": "3 hours",
      "tools": ["Tool1", "Tool2"],
      "inputs": [{ "what": "", "fromOrTo": "", "method": "" }],
      "steps": [
        {
          "order": 1,
          "title": "Step name",
          "description": "What happens",
          "actor": "human",
          "tool": "ToolName",
          "touchpoints": ["c1"],
          "sharedWith": [],
          "aiReady": false
        }
      ],
      "outputs": [{ "what": "", "fromOrTo": "", "method": "" }],
      "painPoints": ["Pain point 1"],
      "isBottleneck": false,
      "tags": ["reporting", "data"],
      "lastUpdated": "{{today}}",
      "addedBy": "c1",
      "knowledge": [
        { "contributorId": "c1", "quote": "Direct quote", "interviewDate": "2026-03-15" }
      ]
    }
  ]
}
```

## Critical Rules

1. **Output ONLY the JSON object.**
2. **Never lose data.** Every citation, pain point, and contributor from the inputs must appear in the output.
3. **Preserve contributor diversity.** If two people see the same workflow differently, keep both perspectives in citations.
4. **Generate tags** — 2-4 lowercase keywords per workflow for search/filtering.
5. **Set `addedBy`** to the contributor who provided the most detailed description.
