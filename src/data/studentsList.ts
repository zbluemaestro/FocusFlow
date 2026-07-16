export interface StudentBot {
  id: string;
  name: string;
  region: 'American' | 'European' | 'Arabian' | 'Persian' | 'Latin American' | 'Asian';
  avatar: string;
  specialty: string;
  color: string;
}

const AMERICAN_NAMES = [
  "Liam", "Noah", "Oliver", "James", "Elijah", "William", "Henry", "Lucas", "Benjamin", "Theodore",
  "Olivia", "Emma", "Charlotte", "Amelia", "Sophia", "Isabella", "Ava", "Mia", "Evelyn", "Luna",
  "Alexander", "Jackson", "Mason", "Michael", "Daniel", "Ella", "Grace", "Chloe", "Harper", "Lily",
  "Samuel", "Owen", "Sebastian", "Jack", "Aidan", "Avery", "Sofia", "Scarlett", "Madison", "Layla",
  "Wyatt", "Carter", "Julian", "John", "David", "Matthew", "Luke", "Lincoln", "Isaac", "Gabriel"
];

const EUROPEAN_NAMES = [
  "Lukas", "Sophie", "Matteo", "Leon", "Amelie", "Hugo", "Elena", "Finn", "Freja", "Luca",
  "Emma", "Jonas", "Mia", "David", "Lea", "Milan", "Giulia", "Louis", "Marie", "Lars",
  "Elin", "Anton", "Maja", "Arthur", "Manon", "Noah", "Clara", "Alessandro", "Francesca", "Hans",
  "Greta", "Pierre", "Camille", "Sven", "Astrid", "Oliver", "Freya", "Stefan", "Maria", "Ivan",
  "Natalia", "Henrik", "Sofia", "Tomasz", "Karolina", "Jan", "Zofia", "Emily", "Finnian", "Bastian"
];

const ARABIAN_NAMES = [
  "Yousef", "Fatima", "Ahmad", "Mariam", "Omar", "Layla", "Zain", "Aisha", "Hamza", "Yasmin",
  "Ali", "Noor", "Mustafa", "Sara", "Ibrahim", "Reem", "Khalid", "Farah", "Tareq", "Hania",
  "Zayed", "Malak", "Bilal", "Jude", "Hamdan", "Dana", "Rayan", "Salma", "Tala", "Yassine",
  "Kenza", "Mahmoud", "Judy", "Anas", "Leen", "Karim", "Maya", "Nader", "Yara", "Hassan",
  "Rania", "Tariq", "Joud", "Habib", "Ghalia", "Fadi", "Zeina", "Majed", "Mona", "Adnan"
];

const PERSIAN_NAMES = [
  "Aras", "Anahita", "Siavash", "Shirin", "Kian", "Soraya", "Farhad", "Roya", "Nima", "Yasaman",
  "Alireza", "Bahar", "Dariush", "Leila", "Mani", "Parisa", "Reza", "Sanaz", "Sohrab", "Taraneh",
  "Cyrus", "Roxana", "Babak", "Elnaz", "Payam", "Negar", "Shahin", "Nazanin", "Kasra", "Mahsa",
  "Milad", "Sahar", "Arash", "Sepideh", "Mehran", "Forough", "Pejman", "Mitra", "Pouya", "Ziba",
  "Arman", "Ghazal", "Ashkan", "Hasti", "Shayan", "Azar", "Yashar", "Nojan", "Donya", "Saman"
];

const LATIN_AMERICAN_NAMES = [
  "Mateo", "Valentina", "Santiago", "Isabella", "Sebastian", "Camila", "Lucas", "Sofia", "Diego", "Mariana",
  "Nicolas", "Gabriela", "Alejandro", "Luciana", "Samuel", "Daniela", "Joaquin", "Maria", "Matias", "Victoria",
  "Benjamin", "Catalina", "Daniel", "Emilia", "Tomas", "Fernanda", "Gabriel", "Valeria", "Felipe", "Renata",
  "Jose", "Andrea", "Juan", "Paula", "Carlos", "Sara", "Emmanuel", "Juana", "Miguel", "Antonia",
  "Luis", "Guadalupe", "Francisco", "Elena", "Pedro", "Carmen", "Javier", "Jorge", "Raul", "Teresa"
];

const ASIAN_NAMES = [
  "Yuto", "Mei", "Min-jun", "Ji-woo", "Haruto", "Yuxuan", "Xinyi", "Kenji", "Sakura", "Hiroto",
  "Aoi", "Jun-seo", "Seo-yeon", "Chen", "Wei", "Zhang", "Wang", "Li", "Kenzo", "Hana",
  "Yuki", "Sora", "Akira", "Hinata", "Kaito", "Riku", "Yua", "Himari", "Tsubasa", "Ren",
  "Min-ji", "Eun-ji", "Hyun-woo", "Seo-jun", "Sang-hun", "Bo-young", "Ji-min", "Ha-yoon", "Min-ho", "Sun-woo",
  "Takashi", "Naoko", "Kazuki", "Sayaka", "Takeshi", "Yoshiko", "Satoshi", "Keiko", "Ryu", "Dan-woo"
];

const AVATARS = ["👨‍💻", "👩‍💻", "👨‍🎨", "👩‍⚕️", "👨‍🔬", "👩‍✍️", "👨‍🏫", "👩‍💼", "👨‍🔧", "👩‍🔬", "🎨", "📝", "📚", "💻", "🔬", "🚀"];

const SPECIALTIES = [
  "React Native & TypeScript", "Organic Chemistry Exam", "Modern European History", "Quantum Physics homework",
  "Machine Learning algorithms", "Creative Writing essay", "UX/UI Mobile App Design", "Linear Algebra prep",
  "Data Structures & Algorithms", "Microeconomics case study", "Environmental Sciences", "JavaScript debugging",
  "Calculus integration", "Ancient Roman History", "Database Schema modeling", "French grammar exercises",
  "Financial Accounting prep", "Cognitive Psychology review", "Astrophysics formulas", "Anatomy flashcards"
];

const COLOR_CLASSES = [
  "text-indigo-400 font-bold",
  "text-emerald-400 font-bold",
  "text-pink-400 font-bold",
  "text-amber-400 font-bold",
  "text-purple-400 font-bold"
];

export const generateStudentBots = (): StudentBot[] => {
  const bots: StudentBot[] = [];

  const addGroup = (names: string[], region: StudentBot['region']) => {
    names.forEach((name, index) => {
      // Pick avatar and specialty deterministically based on name/index to avoid hydration mismatches if generated on client
      const avatarIndex = (name.length + index) % AVATARS.length;
      const specialtyIndex = (name.length * index) % SPECIALTIES.length;
      const colorIndex = (index) % COLOR_CLASSES.length;

      bots.push({
        id: `bot_${region.toLowerCase().replace(" ", "_")}_${index}`,
        name,
        region,
        avatar: AVATARS[avatarIndex],
        specialty: SPECIALTIES[specialtyIndex],
        color: COLOR_CLASSES[colorIndex]
      });
    });
  };

  addGroup(AMERICAN_NAMES, 'American');
  addGroup(EUROPEAN_NAMES, 'European');
  addGroup(ARABIAN_NAMES, 'Arabian');
  addGroup(PERSIAN_NAMES, 'Persian');
  addGroup(LATIN_AMERICAN_NAMES, 'Latin American');
  addGroup(ASIAN_NAMES, 'Asian');

  return bots;
};

export const STUDENT_BOTS = generateStudentBots();
