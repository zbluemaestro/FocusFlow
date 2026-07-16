import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { STUDENT_BOTS, StudentBot } from './src/data/studentsList.js';

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini SDK with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

console.log(apiKey ? 'Gemini AI Client initialized on backend.' : 'Gemini API key not found. Using high-quality procedural fallbacks.');

// Shared Global In-Memory Store
interface ChatMessage {
  id: string;
  senderName: string;
  senderColor: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
  isUser?: boolean;
}

// Room configurations & buddy assignments
interface StudyRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  bgGradient: string;
  buddiesCount: number;
  tagline: string;
}

const defaultRooms: StudyRoom[] = [
  {
    id: 'lofi_cafe',
    name: 'Lofi Music Cafe',
    description: 'A cozy coffee shop with rain pattering on the window and a soothing lofi soundtrack.',
    icon: 'Coffee',
    bgGradient: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    buddiesCount: 4,
    tagline: 'Cozy vibes & background beats'
  },
  {
    id: 'silent_library',
    name: 'Silent Library',
    description: 'A quiet, distraction-free sanctuary for deep focus. Sound is muted, concentration is key.',
    icon: 'BookOpen',
    bgGradient: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20',
    buddiesCount: 5,
    tagline: 'Absolute silence & deep concentration'
  },
  {
    id: 'tech_lab',
    name: 'Tech Den & Lab',
    description: 'A high-energy neon lab where builders, coders, and creators design and compile projects.',
    icon: 'Terminal',
    bgGradient: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
    buddiesCount: 3,
    tagline: 'For coders, writers, and creators'
  },
  {
    id: 'forest_cabin',
    name: 'Forest Treehouse',
    description: 'An open-air cabin surrounded by rustling leaves, birds chirping, and fresh green nature.',
    icon: 'Compass',
    bgGradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
    buddiesCount: 3,
    tagline: 'Natural sounds & peaceful breathing'
  }
];

const allRooms: StudyRoom[] = [...defaultRooms];
const ROOM_IDS: string[] = ['lofi_cafe', 'silent_library', 'tech_lab', 'forest_cabin'];

const roomMessages: Record<string, ChatMessage[]> = {};
const roomBuddies: Record<string, StudentBot[]> = {};
const dmMessages: Record<string, ChatMessage[]> = {};

// 100 deep, highly sophisticated and specific academic/creative topics
const STUDY_TOPICS = [
  "Quantum gravity & gravitons", "Dark matter detection methods", "Exoplanet radial velocity", "Black hole event horizons", "Cosmic microwave background anisotropy",
  "Stellar nucleosynthesis", "Keplerian orbital dynamics", "Nebula dust spectroscopy", "Gravitational wave interferometers", "Gamma-ray burst progenitor stars",
  "Backpropagation optimization in DNNs", "A* search and heuristics", "Graph coloring algorithms", "LLVM compiler architectures", "RISC-V assembly language instruction sets",
  "Third normal form (3NF) relational database design", "SHA-256 cryptographic collisions", "Raft distributed consensus state machine", "Knapsack problem dynamic programming", "Superconducting quantum computing gates",
  "Fourier transform frequency domain analysis", "Complex contour integration", "Real analysis Cauchy sequences", "Non-Euclidean hyperbolic geometry", "Stokes' theorem and vector fields",
  "Markov chain stochastic modeling", "Nash equilibrium game theory strategies", "Differential manifolds and topology", "Second-order linear differential equations", "Riemann hypothesis and prime numbers",
  "Electrophilic aromatic substitution", "Stereochemical chirality & enantiomers", "UV-Vis spectrophotometry calibration", "Entropy changes in closed systems", "Octahedral coordination complexes",
  "Transition metal d-orbital splitting", "Anionic polymer synthesis", "Kinetic theory of gases", "Quantum principal energy levels", "Galvanic cell electrochemistry",
  "CRISPR-Cas9 guide RNA targeting", "Meiotic non-disjunction conditions", "Ribosome tRNA translation", "DNA methylation epigenetics", "Taq polymerase PCR cycles",
  "Citric acid cycle ATP synthesis", "Mendelian independent assortment ratios", "Bacteriophage lysogenic cycles", "RuBisCO carbon fixation reactions", "Metagenomic BLAST sequence matching",
  "Cross-price elasticity of demand", "Keynesian liquidity trap multipliers", "Diminishing marginal utility curves", "Monopolistic deadweight loss", "Subgame perfect Nash equilibria",
  "Stagflation and Phillips curve", "Cognitive framing biases in spending", "Bullwhip effect in supply chains", "Expansionary fiscal policies", "Federal reserve discount rate cuts",
  "Shakespearean iambic pentameter", "IPA phonetic transcription", "Semiotics and Ferdinand de Saussure", "Gothic atmospheric motifs", "Postmodern literary deconstruction",
  "Homeric epic dactylic hexameter", "Chomskyan generative syntax trees", "Proto-Indo-European etymology roots", "Magical realism narrative structures", "Russian formalist defamiliarization",
  "Cuneiform tablets of Uruk", "Gracchi land reforms in Roman Republic", "Sogdian merchants on Silk Road", "Great Schism of 1054", "Steam power in Industrial Revolution",
  "Mayan Long Count calendar wheels", "Estates-General role in French Revolution", "Sengoku Jidai daimyo conflicts", "Yalta Conference Cold War borders", "African national liberation movements",
  "Action potential sodium-potassium pumps", "Classical and operant reinforcement schedules", "Cognitive dissonance reduction", "REM sleep theta wave characteristics", "Lateral inhibition in optical illusions",
  "Semantic vs episodic memory encoding", "Myers-Briggs five-factor theory critique", "Bowlby attachment classification styles", "Asch conformity line experiments", "Hippocampal adult neuroplasticity limits",
  "Kantian categorical imperative", "Nietzschean passive nihilism", "Utilitarian trolley problem variations", "Sartrean existential bad faith", "Radical epistemological skepticism",
  "Aristotelian virtue ethics golden mean", "Chalmers hard problem of consciousness", "Rousseau social contract theory", "Stoic dichotomy of control", "Russells barber paradox solutions"
];

// 200 programmatically generated highly realistic university lecture titles across 10 departments
const DEPARTMENTS = [
  { name: "Astrophysics", prefix: "AST-401" },
  { name: "Artificial Intelligence", prefix: "CS-302" },
  { name: "Advanced Mathematics", prefix: "MATH-505" },
  { name: "Organic Chemistry", prefix: "CHEM-312" },
  { name: "Molecular Biology", prefix: "BIO-420" },
  { name: "Theoretical Economics", prefix: "ECON-380" },
  { name: "Linguistics & Literature", prefix: "LIT-250" },
  { name: "Archaeology & History", prefix: "HIST-310" },
  { name: "Cognitive Psychology", prefix: "PSY-415" },
  { name: "Modern Philosophy", prefix: "PHIL-290" }
];

const LECTURE_SUBTOPICS = [
  "Fundamental Paradigms & Core Principles", "Historical Context and Precursors", "Advanced Methodologies", "Practical Lab Case Studies", "Mathematical Formulations",
  "Emerging Industry Frameworks", "Critical Critiques and Counter-models", "Systemic Structural Analysis", "Quantitative Research Methods", "Ethical Implications and Limits",
  "Future Research Directions & Speculations", "Cross-disciplinary Applications", "Core Proofs and Derivations", "Phenomenological Perspectives", "Experimental Verification & Replication",
  "Algorithmic Optimizations", "Cognitive and Behavioral Overlays", "Paradigm Shifts and Disruptions", "Empirical Modeling and Simulations", "Concluding Review & Exam Synthesis"
];

const STUDY_LECTURES: string[] = [];
DEPARTMENTS.forEach((dept) => {
  LECTURE_SUBTOPICS.forEach((sub, idx) => {
    STUDY_LECTURES.push(`${dept.prefix} Lecture ${idx + 1}: ${dept.name} - ${sub}`);
  });
});

// Allocate 8 distinct buddies per room from our 300 students pool to keep rooms diverse
const assignRoomBuddies = () => {
  const shuffle = [...STUDENT_BOTS];
  // Simple deterministic shuffle to keep it stable on restarts
  for (let i = shuffle.length - 1; i > 0; i--) {
    const j = (i * 17) % shuffle.length;
    const temp = shuffle[i];
    shuffle[i] = shuffle[j];
    shuffle[j] = temp;
  }

  ROOM_IDS.forEach((roomId, index) => {
    // Slice 8 distinct buddies for this room
    roomBuddies[roomId] = shuffle.slice(index * 8, (index + 1) * 8);
  });
};

assignRoomBuddies();

// Helper to format localized short time
const getShortTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Initialize welcome and pre-existing chat messages for rooms
ROOM_IDS.forEach((roomId) => {
  const buddies = roomBuddies[roomId];
  roomMessages[roomId] = [
    {
      id: `welcome-${roomId}`,
      senderName: 'System',
      senderColor: 'text-slate-500',
      message: `👋 Welcome to the Virtual Study Room! Grab a seat, pick your study task, and let's focus together.`,
      timestamp: getShortTime(),
      isSystem: true,
    },
    {
      id: `init-1-${roomId}`,
      senderName: buddies[0].name,
      senderColor: buddies[0].color,
      message: `Hey guys! Settling in to work on ${buddies[0].specialty.toLowerCase()}. Let's stay focused! 🚀`,
      timestamp: new Date(Date.now() - 4 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: `init-2-${roomId}`,
      senderName: buddies[1].name,
      senderColor: buddies[1].color,
      message: `Just started my 25m Pomodoro clock for ${buddies[1].specialty.toLowerCase()}. Drinking some water first 💧`,
      timestamp: new Date(Date.now() - 2 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ];
});

// Procedural Fallback Responses based on keywords (for zero-latency / offline robustness)
const FALLBACK_RESPONSES = [
  "Nice! Let's keep grinding! 🚀",
  "You've got this! One step at a time.",
  "Agreed, staying focused today is so important.",
  "Same here, finishing up my study queue right now.",
  "Nice goal. Let's do a solid focus session together! ⏱️",
  "Let's crush this Pomodoro block!",
  "Great study plan! Tbh, I need to stay off my phone too lol.",
  "We can do this! Habit building in progress 🤝",
  "Setting my timer right now. Let's go!"
];

let geminiCooldownUntil = 0;

const handleGeminiError = (err: any, contextType: string) => {
  const errMsg = err?.message || '';
  const errStatus = err?.status || 0;
  const errString = typeof err === 'object' ? JSON.stringify(err) : String(err);
  
  if (errStatus === 429 || errMsg.includes('429') || errString.includes('RESOURCE_EXHAUSTED')) {
    // Switch to local procedural backup for 2 minutes to let the quota recover
    geminiCooldownUntil = Date.now() + 120000;
    console.log(`[Rate Limit] Gemini 429 Quota Exceeded. Safely switching to local student-chatter backup for 2 minutes.`);
  } else {
    console.error(`${contextType} error:`, err);
  }
};

const getKeywordFallback = (msg: string): string => {
  const text = msg.toLowerCase();
  if (text.includes('hello') || text.includes('hey') || text.includes('hi ')) {
    return "Hey there! Welcome to the desk. What are you studying today? 😊";
  }
  if (text.includes('code') || text.includes('react') || text.includes('programming') || text.includes('bugs')) {
    return "Awesome, coding grinds are the best! Good luck fixing those bugs/compiling. 💻";
  }
  if (text.includes('tired') || text.includes('hard') || text.includes('exhausted')) {
    return "Hang in there! Take a 5m stretch break or drink some water if you need. You're doing great. 🌸";
  }
  if (text.includes('lofi') || text.includes('music') || text.includes('song')) {
    return "Yes! This track list is extremely relaxing, really helps block out the background noise 🎧";
  }
  if (text.includes('break') || text.includes('stretch') || text.includes('water')) {
    return "Good call! Healthy breaks keep the brain fresh. Catch you back in a few! 🧘‍♀️";
  }
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
};

// Periodic Ambient peer chats generator (Every 45 seconds, a random student says something nice in a single random room, reducing API usage significantly)
setInterval(async () => {
  // Select a single random room to receive a message, reducing overall API calls by 4x!
  const roomId = ROOM_IDS[Math.floor(Math.random() * ROOM_IDS.length)];
  
  // 50% chance per interval to keep chatter organic and not spammy
  if (Math.random() > 0.5) return;

  const buddies = roomBuddies[roomId];
  if (!buddies || buddies.length === 0) return;
  const speaker = buddies[Math.floor(Math.random() * buddies.length)];

  let ambientMsg = "";
  if (ai && Date.now() > geminiCooldownUntil) {
    try {
      const randomTopic = STUDY_TOPICS[Math.floor(Math.random() * STUDY_TOPICS.length)];
      const randomLecture = STUDY_LECTURES[Math.floor(Math.random() * STUDY_LECTURES.length)];

      const prompt = `Generate a very short, highly casual chat message (max 18 words) for a student study group. 
The student's name is ${speaker.name}, studying ${speaker.specialty}. 

Academic focus for this message (incorporate or reference one of these):
- A study detail about their specialty: "${speaker.specialty}"
- Mentioning or asking the group a witted question about this specific academic topic: "${randomTopic}"
- Mentioning or asking if anyone else is listening to or struggled with this lecture: "${randomLecture}"

Rules:
1. Speak in lowercase, extremely natural and student-like (use abbreviations like "ikr", "tbh", "prep", "lol", simple emojis).
2. Keep it conversational. They can share a mini-achievement, complain about a concept, or ask if anyone else has studied it.
3. Do not put quotes around the output, do not include their name or prefixes. Just return the raw message.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      }).catch((e) => {
        handleGeminiError(e, 'Ambient Gemini generation');
        return null;
      });
      
      if (response && response.text) {
        ambientMsg = response.text.trim().replace(/^"|"$/g, '');
      }
    } catch (err) {
      handleGeminiError(err, 'Ambient Gemini generation');
    }
  }

  if (!ambientMsg) {
    const randomTopic = STUDY_TOPICS[Math.floor(Math.random() * STUDY_TOPICS.length)];
    const randomLecture = STUDY_LECTURES[Math.floor(Math.random() * STUDY_LECTURES.length)];
    const presets = [
      `Tbh, studying ${speaker.specialty.toLowerCase()} is going surprisingly well today!`,
      `Almost done reviewing ${randomTopic.toLowerCase()}! Time to push hard. 📝`,
      `Focusing feels much easier when everyone else is working too, ikr?`,
      `did anyone watch ${randomLecture}? it was actually so good`,
      `Locked in for another Pomodoro block! No distractions. 🚫📱`,
      `Just completed a solid 25m session. Feels amazing to cross that off!`,
      `grabbing some coffee first, then locking back in ☕`,
      `how's everyone doing on their pomodoro goals today?`,
      `gonna try to complete 2 more sessions on ${speaker.specialty.toLowerCase()} before calling it a day!`,
      `tbh this lofi playlist is doing wonders for my focus while reading ${randomTopic.toLowerCase()}`
    ];
    ambientMsg = presets[Math.floor(Math.random() * presets.length)];
  }

  roomMessages[roomId].push({
    id: `ambient-${Date.now()}-${Math.random()}`,
    senderName: speaker.name,
    senderColor: speaker.color,
    message: ambientMsg,
    timestamp: getShortTime(),
  });

  // Limit chat histories to 50 messages to save memory
  if (roomMessages[roomId].length > 50) {
    roomMessages[roomId].shift();
  }
}, 45000);

// API Endpoints

// Get all available buddies in the school so users can search and invite them
app.get('/api/buddies/list', (req, res) => {
  res.json(STUDENT_BOTS);
});

// Get all study rooms (including custom created ones)
app.get('/api/rooms', (req, res) => {
  res.json(allRooms);
});

// Create a new custom room and invite people by username
app.post('/api/rooms/create', (req, res) => {
  const { name, description, icon, tagline, invitedBuddyNames } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  const cleanName = name.trim();
  const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Determine a random attractive bgGradient
  const gradients = [
    'from-indigo-500/10 to-purple-500/10 border-indigo-500/20',
    'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
    'from-pink-500/10 to-rose-500/10 border-pink-500/20',
    'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    'from-blue-500/10 to-cyan-500/10 border-blue-500/20'
  ];
  const bgGradient = gradients[Math.floor(Math.random() * gradients.length)];

  // Create the room record
  const newRoom: StudyRoom = {
    id: roomId,
    name: cleanName,
    description: description?.trim() || 'A private custom workspace created for deep focus and collaborative study.',
    icon: icon || 'Coffee',
    bgGradient,
    buddiesCount: Array.isArray(invitedBuddyNames) ? invitedBuddyNames.length : 0,
    tagline: tagline?.trim() || 'Custom private focus lounge'
  };

  allRooms.push(newRoom);
  ROOM_IDS.push(roomId);

  // Map invited usernames to actual StudentBots
  const assignedBuddies: StudentBot[] = [];
  if (Array.isArray(invitedBuddyNames)) {
    invitedBuddyNames.forEach((buddyName) => {
      const found = STUDENT_BOTS.find((b) => b.name.toLowerCase() === buddyName.trim().toLowerCase());
      if (found) {
        // Create a copy of the bot with standard active parameters
        assignedBuddies.push(found);
      }
    });
  }

  // If user invited nobody or too few, auto-fill with a couple of random buddies to keep it alive
  if (assignedBuddies.length < 3) {
    const remainingBots = STUDENT_BOTS.filter((b) => !assignedBuddies.some((ab) => ab.id === b.id));
    const toAdd = 4 - assignedBuddies.length;
    for (let i = 0; i < toAdd; i++) {
      const randBot = remainingBots[Math.floor(Math.random() * remainingBots.length)];
      if (randBot && !assignedBuddies.some((ab) => ab.id === randBot.id)) {
        assignedBuddies.push(randBot);
      }
    }
  }

  roomBuddies[roomId] = assignedBuddies;
  newRoom.buddiesCount = assignedBuddies.length;

  // Initialize room chat history with custom system messages and buddy greeting
  const joinedBuddiesStr = assignedBuddies.map(b => b.name).join(', ');
  roomMessages[roomId] = [
    {
      id: `welcome-${roomId}`,
      senderName: 'System',
      senderColor: 'text-slate-500',
      message: `🔒 Custom Study Room "${cleanName}" has been successfully initialized! Active members: ${joinedBuddiesStr}. Let's lock in!`,
      timestamp: getShortTime(),
      isSystem: true,
    }
  ];

  // Pick a couple of invited bots to post an enthusiastic welcome message!
  if (assignedBuddies.length > 0) {
    const firstBot = assignedBuddies[0];
    roomMessages[roomId].push({
      id: `init-custom-1-${roomId}`,
      senderName: firstBot.name,
      senderColor: firstBot.color,
      message: `Ayyy! Thanks for inviting me to "${cleanName}". Settling in to work on ${firstBot.specialty.toLowerCase()} now! Let's get this bread. 🚀`,
      timestamp: getShortTime(),
    });

    if (assignedBuddies.length > 1) {
      const secondBot = assignedBuddies[1];
      roomMessages[roomId].push({
        id: `init-custom-2-${roomId}`,
        senderName: secondBot.name,
        senderColor: secondBot.color,
        message: `this private room is actually so cozy, thanks for the invite. locking down for a pomodoro session on ${secondBot.specialty.toLowerCase()} 📚`,
        timestamp: getShortTime(),
      });
    }
  }

  res.status(201).json(newRoom);
});

// 1. Get room buddies
app.get('/api/rooms/:roomId/buddies', (req, res) => {
  const { roomId } = req.params;
  if (!ROOM_IDS.includes(roomId)) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(roomBuddies[roomId] || []);
});

// 2. Get room messages
app.get('/api/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  if (!ROOM_IDS.includes(roomId)) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(roomMessages[roomId] || []);
});

// 3. Send message (User sends a message)
app.post('/api/rooms/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;
  const { senderName, message, senderColor } = req.body;

  if (!ROOM_IDS.includes(roomId)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const userMsg: ChatMessage = {
    id: `user-${Date.now()}-${Math.random()}`,
    senderName: senderName || 'Anonymous Student',
    senderColor: senderColor || 'text-rose-400 font-black',
    message: message.trim(),
    timestamp: getShortTime(),
    isUser: true,
  };

  roomMessages[roomId].push(userMsg);
  res.status(201).json(userMsg);

  // Trigger automated AI agent bots responses focusing on the user's message!
  const buddies = roomBuddies[roomId];
  const activeBots = buddies.filter((b) => b.name !== senderName);
  if (activeBots.length === 0) return;

  // Check if a specific bot is mentioned or addressed by name
  const msgLower = message.toLowerCase();
  const mentionedBot = activeBots.find((b) => {
    const nameLower = b.name.toLowerCase();
    return msgLower.includes(nameLower) || msgLower.includes(`@${nameLower}`);
  });

  const responders = [];
  if (mentionedBot) {
    responders.push(mentionedBot);
  } else {
    // Pick 1 or 2 random responders to reply after a typing delay
    const numResponders = Math.random() > 0.65 ? 2 : 1;
    const tempBots = [...activeBots];
    while (responders.length < numResponders && tempBots.length > 0) {
      const idx = Math.floor(Math.random() * tempBots.length);
      responders.push(tempBots.splice(idx, 1)[0]);
    }
  }

  responders.forEach((bot, botIndex) => {
    // Schedule responses with realistic, staggered student-typing delays (2 to 5 seconds)
    const delay = 2200 + botIndex * 2400 + Math.random() * 1200;

    setTimeout(async () => {
      let responseText = "";

      if (ai && Date.now() > geminiCooldownUntil) {
        try {
          // Provide recent chat history to the Gemini API so the bots actually focus on and respond to the user's exact words!
          const recentHistory = roomMessages[roomId]
            .slice(-8)
            .map((m) => `${m.senderName}: "${m.message}"`)
            .join('\n');

          // Select a random topic and lecture from our massive dynamic database to share as context
          const randomTopic = STUDY_TOPICS[Math.floor(Math.random() * STUDY_TOPICS.length)];
          const randomLecture = STUDY_LECTURES[Math.floor(Math.random() * STUDY_LECTURES.length)];

          const prompt = `You are simulating a real human student in a virtual study room called "${roomId.replace('_', ' ')}".
You are responding as ${bot.name} (from ${bot.region}, avatar: ${bot.avatar}, current study task: ${bot.specialty}).
The user (${senderName}) sent: "${message}"

Recent chat history for context:
${recentHistory}

Your student academic context:
- You have high interest in: "${bot.specialty}"
- You are currently preparing for or reviewing this topic: "${randomTopic}"
- You recently completed or are listening to this lecture: "${randomLecture}"

Rules to speak like a real human:
1. Speak in a completely natural, human, and conversational student style. Use lowercase, simple contractions (ikr, tbh, idk, omg, gonna, kinda, lol), relaxed punctuation, and casual, contextual emojis.
2. Be incredibly smart, witty, and understanding. You can debate, support, or spark open-ended discussions about deep concepts.
3. Bring up academic discussions naturally. For example, refer to the topic "${randomTopic}" or the lecture "${randomLecture}" to ask advice, complain about its difficulty, or share a cool study insight (e.g., "tbh lecture 42 on Taylor series is actually frying my brain today lol" or "anyone else reading up on ${randomTopic.toLowerCase()}? some of the formulas are super intense").
4. Respond directly to the user's words, but DO NOT roboticly force a mention tag or mention prefix (no forced "@${senderName}" in every message, just talk like they are right next to you in the study group!). Feel free to name-drop them casually if it fits, but keep it organic.
5. Keep your response short and highly readable (typically 12 to 32 words, 1-2 sentences). Do not label your output with names or quotes.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
          }).catch((e) => {
            handleGeminiError(e, 'Gemini response generation');
            return null;
          });

          if (response && response.text) {
            responseText = response.text.trim().replace(/^"|"$/g, '');
          }
        } catch (err) {
          handleGeminiError(err, 'Gemini response generation');
        }
      }

      // If Gemini key is missing, or rate-limited/errored, use the context keyword matching engine with custom smart responses
      if (!responseText) {
        const randomTopic = STUDY_TOPICS[Math.floor(Math.random() * STUDY_TOPICS.length)];
        const randomLecture = STUDY_LECTURES[Math.floor(Math.random() * STUDY_LECTURES.length)];
        const fallbackAnswers = [
          `ikr! currently trying to wrap my head around ${randomTopic.toLowerCase()} rn, it is so intense`,
          `tbh that sounds super cool. i'm stuck listening to ${randomLecture} and my brain is already cooked`,
          `nice! let's stay locked in. i need to finish this block so i can review ${randomTopic.toLowerCase()}`,
          `wait, does anyone actually understand ${randomTopic.toLowerCase()}? some of these slides are so confusing lol`,
          `focusing together makes it so much easier. just starting a fresh pomodoro for ${bot.specialty.toLowerCase()}!`,
          `ikr! let's keep grinding, we've got this.`
        ];
        responseText = fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)];
      }

      const botMsg: ChatMessage = {
        id: `bot-reply-${Date.now()}-${Math.random()}`,
        senderName: bot.name,
        senderColor: bot.color,
        message: responseText,
        timestamp: getShortTime(),
      };

      roomMessages[roomId].push(botMsg);

      if (roomMessages[roomId].length > 50) {
        roomMessages[roomId].shift();
      }
    }, delay);
  });
});

// Setup Vite Dev Server / Static files Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in Development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static build from dist/.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express custom server running on port ${PORT}`);
  });
}

startServer();
