import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const email = process.env.SEED_EMAIL!;
const password = process.env.SEED_PASSWORD!;

const supabase = createClient(supabaseUrl, supabaseKey);

const projects = [
  {
    title: "The Midnight Garden",
    description: "A literary novel about memory, loss, and the gardens we tend in our minds.",
  },
  {
    title: "Screenplay: Last Light",
    description: "A thriller set in a coastal town where the lighthouse keeper discovers something in the fog.",
  },
  {
    title: "Short Story Collection",
    description: "Working title: Small Fires. Stories about ordinary people in extraordinary moments.",
  },
];

const notesPerProject = [
  [
    { title: "Opening scene", content: "Elena stands at the edge of her mother's garden. The roses have gone wild. She hasn't been back in seven years." },
    { title: "Character: Elena", content: "38, landscape architect in Boston. Left home after her father's funeral. Carries guilt like a stone in her pocket." },
    { title: "Theme notes", content: "Memory as a garden — what we cultivate, what we let grow wild, what we uproot entirely." },
    { title: "Chapter 3 draft", content: "The greenhouse glass was clouded with age. Inside, her mother's orchids had somehow survived — impossible, miraculous, accusatory." },
  ],
  [
    { title: "FADE IN", content: "EXT. CAPE MORROW LIGHTHOUSE - NIGHT\n\nFog rolls across black water. A single beam sweeps the darkness. We hear a FOGHORN, low and mournful." },
    { title: "Tom's backstory", content: "Former coast guard. Lost his partner in a rescue gone wrong. Took the lighthouse job to disappear. Hasn't spoken to his daughter in two years." },
    { title: "Act 2 turning point", content: "Tom sees the ship in the fog — but it's not on any registry. And it's heading straight for the rocks." },
  ],
  [
    { title: "The Waitress", content: "She memorized their orders not because she had to, but because remembering made her feel less invisible." },
    { title: "Small Fires - title story", content: "The smoke alarm went off at 3am. By the time he got to the kitchen, his wife had already put out the fire. 'I was making tea,' she said. 'I couldn't sleep.' He didn't ask why. They both knew." },
    { title: "Story idea: The Collector", content: "A man who collects last words. He sits with the dying in hospice. He tells himself it's a kindness." },
    { title: "Revision notes", content: "Cut the first three paragraphs of 'The Waitress' — start with the coffee pot breaking. Trust the reader more." },
  ],
];

async function seed() {
  console.log("Signing in...");

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("Sign in failed:", signInError.message);
    console.error("Make sure SEED_EMAIL and SEED_PASSWORD are set in .env.local");
    process.exit(1);
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("Could not get user after sign in.");
    process.exit(1);
  }

  console.log(`Seeding data for: ${user.email}\n`);

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];

    const { data: createdProject, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        title: project.title,
        description: project.description,
        status: "active",
      })
      .select()
      .single();

    if (projectError) {
      console.error(`Failed to create project: ${project.title}`, projectError.message);
      continue;
    }

    console.log(`? Project: ${project.title}`);

    for (const note of notesPerProject[i]) {
      const { error: noteError } = await supabase
        .from("notes")
        .insert({
          user_id: user.id,
          project_id: createdProject.id,
          title: note.title,
          content: note.content,
        });

      if (noteError) {
        console.error(`  ? Note failed: ${note.title}`, noteError.message);
        continue;
      }

      console.log(`  ? Note: ${note.title}`);
    }
  }

  console.log("\nSeeding complete.");
}

seed();
