import { PropositionsLoadError, loadPropositionsLesson } from "@/lib/lessons/propositions";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json({ lesson: await loadPropositionsLesson() });
  } catch (error) {
    return Response.json(
      { error: error instanceof PropositionsLoadError ? error.message : "Unable to load Propositions." },
      { status: error instanceof PropositionsLoadError ? error.status : 500 },
    );
  }
}
