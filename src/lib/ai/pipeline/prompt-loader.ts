import { readFile } from "fs/promises";
import path from "path";

const PROMPTS_DIR = path.join(process.cwd(), "src/lib/ai/prompts");

/**
 * Load a markdown prompt file and inject template variables.
 * Variables use {{variable_name}} syntax.
 */
export async function loadPrompt(
  filename: string,
  variables?: Record<string, string>
): Promise<string> {
  const filePath = path.join(PROMPTS_DIR, filename);
  let content = await readFile(filePath, "utf-8");

  if (variables) {
    for (const [key, value] of Object.entries(variables)) {
      content = content.replaceAll(`{{${key}}}`, value);
    }
  }

  return content;
}

/**
 * Load multiple prompt files and concatenate them with a separator.
 * Useful for composing system prompts from multiple sources.
 */
export async function loadPrompts(
  filenames: string[],
  variables?: Record<string, string>
): Promise<string> {
  const prompts = await Promise.all(
    filenames.map((f) => loadPrompt(f, variables))
  );
  return prompts.join("\n\n---\n\n");
}

/**
 * Load the AI Transformation Framework document.
 * Used as context injection for analysis prompts.
 */
export async function loadFramework(): Promise<string> {
  const frameworkPath = path.join(
    process.cwd(),
    "src/lib/ai-transformation-framework.md"
  );
  return readFile(frameworkPath, "utf-8");
}
