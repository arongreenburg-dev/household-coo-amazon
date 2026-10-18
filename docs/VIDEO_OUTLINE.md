# Household COO — narrated demo script and walkthrough

Target: 2 minutes 30 seconds, with a hard editing target under 2 minutes 50 seconds.
Use the real production app at https://household-coo-amazon.vercel.app/ and synthetic Morgan household data.
This is a simulated Alexa+ experience with live Amazon Bedrock Nova Micro, not a live Alexa device integration.

## Recording approach

Record the app screen silently, then add one neutral narration track. A webcam and multiple character voices are unnecessary. An ordinary recorded human narration also works. Synthetic narration has not yet been generated; it needs a speech-generation capability. Do not label screenshots or generated UI animation as continuous live footage.

Before recording:
1. Open the app and click Reset demo plan. Keep the simulated Alexa+ and synthetic-data labels visible in the opening.
2. Rehearse the sequence once. Confirm Bedrock mode and allow each request to finish.
3. Record only the app window or app area. Use the Chromebook screen recorder in video mode, with microphone off for a silent take.
4. Start at the top of Family Radar. Do not open AWS billing, credentials, or personal inboxes.
5. Pause briefly on important results. If model latency makes the take too long, trim waiting time while retaining the actual request and result. Do not substitute fabricated results.

## Timeline and narration

### 0:00–0:18 — Problem and scope
On screen: Family Radar overview and simulation label.

Narration:
“School emails, appointments, bills, and activity schedules create a second job for families: figuring out what needs attention. Household COO turns those scattered notices into a weekly action plan. This is a simulated Alexa Plus experience using synthetic household data.”

### 0:18–0:45 — Sources become obligations
On screen: Open Household sources and one school notice. Return to Family Radar and click Scan demo sources. Wait for the actual scan result.

Narration:
“Here are the original demo notices. Amazon Bedrock Nova Micro reads ten synthetic sources and extracts household obligations with provenance. Family Radar organizes deadlines, upcoming events, and tasks that can wait. You can inspect the original message behind a recommendation.”

### 0:45–1:08 — Explainable conversation
On screen: Click What is most urgent? Then type Why is that important? Expand the returned household sources.

Narration:
“I can ask what is most urgent, then ask why. The assistant uses the current family plan and cites the household sources behind its answer. The goal is to help a parent decide what to do next, with enough context to check the recommendation.”

### 1:08–1:40 — Resolve a conflict
On screen: Show the 15-minute dentist/soccer overlap. Type Alex can take Noah to the dentist. Wait for the conflict count to become zero. Ask What conflicts do we have?

Narration:
“Wednesday has a fifteen-minute overlap: Jamie is assigned to both the dentist and soccer. I assign Alex to the dentist. The local plan updates, the parent conflict disappears, and the follow-up answer reflects the new assignments. This changes the demo plan, not an external calendar.”

### 1:40–2:08 — Follow through and remember
On screen: Open the permission-form item, click Mark complete, close details, then ask What is most urgent? Refresh to show decisions restored.

Narration:
“Next, I mark the permission form complete. The assistant now recommends outstanding work rather than repeating the completed task. Refreshing restores the saved decisions in this browser. Source extraction and conversation use Bedrock; application logic validates the data and checks scheduling overlaps.”

### 2:08–2:30 — Architecture and close
On screen: Return to overview. Keep the app URL visible. Optionally end with the public repository URL as an editing caption.

Narration:
“The app uses Next.js, TypeScript, and the official Model Context Protocol SDK. Real account connections and shared cross-device decisions are future work. Today, Household COO demonstrates a complete loop: notices, priorities, conversation, and a plan that changes when the family makes a decision. Less juggling. More living.”

## Honest-demo checks

- Live extraction wording, priority, and preparation-card placement can vary. Narrate the actual result; do not promise the mock's exact layout.
- Inspect source citations before recording and allow responses to complete.
- Do not claim that the app sends messages, pays bills, books appointments, connects personal accounts, or shares decisions between devices.
- Save the silent recording and narration separately before combining them into an MP4. Add readable captions if practical.
- Watch the final export through once and confirm audio, legibility, factual accuracy, and duration.
- Upload publicly to YouTube or Vimeo and paste the final URL into Devpost.
- Optional gallery: use two or three actual app screenshots (overview, conflict, resolved plan). The video remains required.
