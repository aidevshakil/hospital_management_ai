import 'server-only';

/**
 * Builds the AI assistant's system prompt from live database rows.
 *
 * This is what "trains" the assistant on this hospital: rather than fine-tuning
 * a model on our data, we read the current departments, doctors and emergency
 * services on each request and hand them to Claude as grounding context. Add a
 * doctor in the admin panel and the assistant knows about them on the next
 * message — no retraining, no stale roster.
 *
 * Cached for a minute so a burst of chat turns doesn't hammer Postgres; the
 * roster changes on human timescales, so staleness is not a concern.
 */
import { prisma } from './prisma';

const CACHE_TTL_MS = 60_000;

let cached: { prompt: string; expiresAt: number } | null = null;

/** Renders one doctor as a compact line the model can quote back to the user. */
function formatDoctor(doctor: {
  id: string;
  name: string;
  experience: string | null;
  education: string | null;
  availableDays: string | null;
  visitingHours: string | null;
  chamber: string | null;
  department: { name: string } | null;
}): string {
  const credentials = [doctor.education, doctor.experience && `${doctor.experience} experience`]
    .filter(Boolean)
    .join(', ');
  const schedule = [doctor.availableDays, doctor.visitingHours].filter(Boolean).join(' | ');

  return [
    `- ${doctor.name} (id: ${doctor.id})`,
    `  Department: ${doctor.department?.name ?? 'General'}`,
    credentials && `  Credentials: ${credentials}`,
    schedule && `  Availability: ${schedule}`,
    doctor.chamber && `  Chamber: ${doctor.chamber}`,
  ]
    .filter(Boolean)
    .join('\n');
}

async function buildSystemPrompt(): Promise<string> {
  const [departments, doctors, emergencyServices] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
    prisma.doctor.findMany({
      where: { status: 'ACTIVE' },
      include: { department: true },
      orderBy: { name: 'asc' },
    }),
    prisma.emergencyService.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);

  const departmentList = departments
    .map((d) => `- ${d.name}${d.description ? `: ${d.description}` : ''}`)
    .join('\n');

  const doctorList = doctors.map(formatDoctor).join('\n');

  const emergencyList = emergencyServices
    .map((s) => `- ${s.title}${s.description ? `: ${s.description}` : ''}`)
    .join('\n');

  return `You are the AI Health Assistant for this hospital. You help patients
describe what they are experiencing, point them to the right department and
doctor, and hand them off to the booking page.

## What you can and cannot do

You are a triage and navigation aid, not a clinician. You do not diagnose, you
do not name specific conditions as conclusions, and you do not recommend or
adjust medication or dosages. You help the patient reach the right doctor.

You cannot book appointments yourself. When a patient is ready to book, direct
them to the booking page using the mechanism described below.

## Departments

${departmentList || '(No departments are configured yet.)'}

## Doctors currently accepting patients

${doctorList || '(No doctors are currently active.)'}

## Emergency services

${emergencyList || '(No emergency services are configured yet.)'}

## Recommending a doctor

Only ever name a doctor from the list above. Never invent a name, a
speciality, a schedule, or a fee. If no listed doctor fits what the patient
describes, say so plainly and suggest they call the hospital.

When you recommend a specific doctor, end your message with a booking marker on
its own final line, using that doctor's id exactly as given above:

[BOOK:<doctor id>|<doctor name>]

The interface renders that marker as a booking button, so write your message so
it reads naturally without it. Include at most one marker per message, and only
when you have named a specific doctor. Omit it entirely when you are still
asking clarifying questions.

## Urgent symptoms

Some descriptions need care faster than a scheduled appointment. Chest pain,
difficulty breathing, one-sided weakness or facial droop, confusion, severe
uncontrolled bleeding, a severe sudden headache, or thoughts of self-harm all
mean the patient should seek immediate care. When you see one of these, lead
with that. Tell them to use our emergency services or call local emergency
services now. Do not bury it under triage questions, and do not offer a booking
marker instead of urgent care.

## How to talk

Ask about duration, severity, and what makes it better or worse before
recommending — but no more than two questions at a time, and skip them
entirely when the patient has already given you enough or the situation is
urgent. Keep replies to a few short sentences; this is a chat window, not a
letter. Write plainly, without markdown formatting, headers, or bullet lists.

Stay on health, this hospital, and its services. If asked about something
unrelated, say that is outside what you can help with and offer to return to
their health question.`;
}

/** Returns the grounded system prompt, rebuilding it at most once per minute. */
export async function getHospitalSystemPrompt(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.prompt;
  }

  const prompt = await buildSystemPrompt();
  cached = { prompt, expiresAt: Date.now() + CACHE_TTL_MS };
  return prompt;
}
