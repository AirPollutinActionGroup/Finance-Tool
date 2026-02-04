import type {
  City,
  Donor,
  Employee,
  GeographyState,
  Program,
} from "../types";

const portraitUrls = [
  "https://commons.wikimedia.org/wiki/Special:FilePath/Abraham_Lincoln_November_1863.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Marie_Curie_c1920.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Charles_Darwin_seated.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Florence_Nightingale.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Mark_Twain_by_AF_Bradley.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Thomas_Edison2.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Ada_Lovelace_portrait.jpg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Louis_Pasteur.jpg",
];

const geographyLookup: Record<
  string,
  { state: GeographyState; city: City }
> = {
  "Delhi NCR": { state: "Delhi NCR", city: "Delhi" },
  "UP - Prayagraj": { state: "Uttar Pradesh", city: "Prayagraj" },
  "UP - Banaras": { state: "Uttar Pradesh", city: "Banaras" },
  "UP - Lucknow": { state: "Uttar Pradesh", city: "Lucknow" },
  "Bihar - Gaya": { state: "Bihar", city: "Gaya" },
  "Bihar - Muzaffarpur": { state: "Bihar", city: "Muzaffarpur" },
};

const defaultGeography = { state: "Delhi NCR", city: "Delhi" } as const;

export const programs: Program[] = [
  {
    id: "dsp",
    name: "DSP",
    description: "Digital Skills Program focused on employability.",
    geography: "Delhi NCR",
    cities: ["Delhi"],
  },
  {
    id: "mrs",
    name: "MRS",
    description: "Maternal and Reproductive Support services.",
    geography: "Uttar Pradesh",
    cities: ["Lucknow", "Prayagraj"],
  },
  {
    id: "cd",
    name: "C&D",
    description: "Community Development initiatives and outreach.",
    geography: "Bihar",
    cities: ["Gaya", "Muzaffarpur"],
  },
];

export const donors: Donor[] = [
  {
    id: "donor-aurora",
    name: "Aurora Global Trust",
    type: "International",
    contributionAmount: 2500000,
    adminOverheadPercent: 18,
    fcraApproved: true,
    preferences: [
      { programId: "dsp", weight: 50 },
      { programId: "mrs", weight: 30 },
      { programId: "cd", weight: 20 },
    ],
  },
  {
    id: "donor-saras",
    name: "Saras Foundation",
    type: "National",
    contributionAmount: 1200000,
    adminOverheadPercent: 12,
    fcraApproved: false,
    preferences: [
      { programId: "dsp", weight: 60 },
      { programId: "mrs", weight: 20 },
    ],
  },
  {
    id: "donor-pragati",
    name: "Pragati CSR Fund",
    type: "CSR",
    contributionAmount: 1800000,
    adminOverheadPercent: 15,
    fcraApproved: false,
    preferences: [
      { programId: "mrs", weight: 50 },
      { programId: "cd", weight: 35 },
    ],
  },
  {
    id: "donor-mehra",
    name: "Mehra Family Office",
    type: "HNI",
    contributionAmount: 800000,
    adminOverheadPercent: 10,
    fcraApproved: false,
    preferences: [{ programId: "dsp", weight: 70 }],
  },
  {
    id: "donor-northstar",
    name: "Northstar Impact",
    type: "International",
    contributionAmount: 1500000,
    adminOverheadPercent: 18,
    fcraApproved: true,
    preferences: [
      { programId: "cd", weight: 40 },
      { programId: "mrs", weight: 40 },
    ],
  },
];

export const donorMovementEvents = [
  {
    id: "move-aurora-01",
    donorId: "donor-aurora",
    employeeId: "emp-013",
    summary: "Rahul Bansal moved into DSP funding",
    date: "2024-10-12",
  },
  {
    id: "move-aurora-02",
    donorId: "donor-aurora",
    employeeId: "emp-021",
    summary: "Aditi Rao added to MRS allocation",
    date: "2024-09-03",
  },
  {
    id: "move-saras-01",
    donorId: "donor-saras",
    employeeId: "emp-008",
    summary: "Isha Kapoor shifted to DSP coverage",
    date: "2024-08-22",
  },
  {
    id: "move-pragati-01",
    donorId: "donor-pragati",
    employeeId: "emp-033",
    summary: "Ritika Sen reassigned to C&D focus",
    date: "2024-08-15",
  },
  {
    id: "move-mehra-01",
    donorId: "donor-mehra",
    employeeId: "emp-003",
    summary: "Rohan Mehta added to DSP support",
    date: "2024-07-18",
  },
  {
    id: "move-northstar-01",
    donorId: "donor-northstar",
    employeeId: "emp-045",
    summary: "Aakash Singh moved to C&D allocation",
    date: "2024-07-05",
  },
];

type RawEmployee = {
  id: string;
  name: string;
  role: string;
  monthlyCost: number;
  geography: string;
  photoUrl: string;
};

const rawEmployees: RawEmployee[] = [
  {
    id: "emp-001",
    name: "Aarav Singh",
    role: "Program Manager",
    monthlyCost: 85000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[0],
  },
  {
    id: "emp-002",
    name: "Ananya Gupta",
    role: "Field Officer",
    monthlyCost: 45000,
    geography: "UP - Prayagraj",
    photoUrl: portraitUrls[1],
  },
  {
    id: "emp-003",
    name: "Rohan Mehta",
    role: "Data Analyst",
    monthlyCost: 60000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[2],
  },
  {
    id: "emp-004",
    name: "Priya Sharma",
    role: "Community Liaison",
    monthlyCost: 42000,
    geography: "UP - Banaras",
    photoUrl: portraitUrls[3],
  },
  {
    id: "emp-005",
    name: "Vikram Iyer",
    role: "Finance Associate",
    monthlyCost: 55000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[4],
  },
  {
    id: "emp-006",
    name: "Neha Verma",
    role: "Operations Lead",
    monthlyCost: 78000,
    geography: "UP - Lucknow",
    photoUrl: portraitUrls[5],
  },
  {
    id: "emp-007",
    name: "Karan Rao",
    role: "Training Coordinator",
    monthlyCost: 48000,
    geography: "Bihar - Gaya",
    photoUrl: portraitUrls[6],
  },
  {
    id: "emp-008",
    name: "Isha Kapoor",
    role: "Monitoring Specialist",
    monthlyCost: 52000,
    geography: "UP - Prayagraj",
    photoUrl: portraitUrls[7],
  },
  {
    id: "emp-009",
    name: "Arjun Nair",
    role: "Partnerships Lead",
    monthlyCost: 70000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[0],
  },
  {
    id: "emp-010",
    name: "Meera Das",
    role: "Research Associate",
    monthlyCost: 50000,
    geography: "Bihar - Muzaffarpur",
    photoUrl: portraitUrls[1],
  },
  {
    id: "emp-011",
    name: "Aditya Khanna",
    role: "Field Officer",
    monthlyCost: 43000,
    geography: "UP - Banaras",
    photoUrl: portraitUrls[2],
  },
  {
    id: "emp-012",
    name: "Kavya Joshi",
    role: "HR Associate",
    monthlyCost: 47000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[3],
  },
  {
    id: "emp-013",
    name: "Rahul Bansal",
    role: "Program Manager",
    monthlyCost: 82000,
    geography: "UP - Lucknow",
    photoUrl: portraitUrls[4],
  },
  {
    id: "emp-014",
    name: "Sanya Pillai",
    role: "Data Analyst",
    monthlyCost: 59000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[5],
  },
  {
    id: "emp-015",
    name: "Manish Goyal",
    role: "Community Liaison",
    monthlyCost: 41000,
    geography: "Bihar - Gaya",
    photoUrl: portraitUrls[6],
  },
  {
    id: "emp-016",
    name: "Sneha Kulkarni",
    role: "Outreach Coordinator",
    monthlyCost: 46000,
    geography: "UP - Prayagraj",
    photoUrl: portraitUrls[7],
  },
  {
    id: "emp-017",
    name: "Dev Patel",
    role: "Finance Associate",
    monthlyCost: 54000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[0],
  },
  {
    id: "emp-018",
    name: "Pooja Jain",
    role: "Monitoring Specialist",
    monthlyCost: 51000,
    geography: "UP - Banaras",
    photoUrl: portraitUrls[1],
  },
  {
    id: "emp-019",
    name: "Nikhil Malhotra",
    role: "Operations Lead",
    monthlyCost: 76000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[2],
  },
  {
    id: "emp-020",
    name: "Ritu Singh",
    role: "Training Coordinator",
    monthlyCost: 47000,
    geography: "Bihar - Muzaffarpur",
    photoUrl: portraitUrls[3],
  },
  {
    id: "emp-021",
    name: "Aditi Rao",
    role: "Partnerships Lead",
    monthlyCost: 69000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[4],
  },
  {
    id: "emp-022",
    name: "Sameer Khan",
    role: "Field Officer",
    monthlyCost: 44000,
    geography: "UP - Lucknow",
    photoUrl: portraitUrls[5],
  },
  {
    id: "emp-023",
    name: "Tanya Arora",
    role: "Research Associate",
    monthlyCost: 52000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[6],
  },
  {
    id: "emp-024",
    name: "Mohit Chandra",
    role: "Community Liaison",
    monthlyCost: 40000,
    geography: "UP - Prayagraj",
    photoUrl: portraitUrls[7],
  },
  {
    id: "emp-025",
    name: "Shreya Menon",
    role: "Data Analyst",
    monthlyCost: 61000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[0],
  },
  {
    id: "emp-026",
    name: "Harsh Vardhan",
    role: "Program Manager",
    monthlyCost: 83000,
    geography: "UP - Banaras",
    photoUrl: portraitUrls[1],
  },
  {
    id: "emp-027",
    name: "Rhea Kulkarni",
    role: "HR Associate",
    monthlyCost: 48000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[2],
  },
  {
    id: "emp-028",
    name: "Saurabh Shukla",
    role: "Outreach Coordinator",
    monthlyCost: 45000,
    geography: "Bihar - Gaya",
    photoUrl: portraitUrls[3],
  },
  {
    id: "emp-029",
    name: "Nandini Roy",
    role: "Finance Associate",
    monthlyCost: 56000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[4],
  },
  {
    id: "emp-030",
    name: "Amit Tripathi",
    role: "Monitoring Specialist",
    monthlyCost: 52000,
    geography: "UP - Lucknow",
    photoUrl: portraitUrls[5],
  },
  {
    id: "emp-031",
    name: "Juhi Kapoor",
    role: "Field Officer",
    monthlyCost: 43000,
    geography: "Bihar - Muzaffarpur",
    photoUrl: portraitUrls[6],
  },
  {
    id: "emp-032",
    name: "Pranav Gupta",
    role: "Operations Lead",
    monthlyCost: 77000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[7],
  },
  {
    id: "emp-033",
    name: "Ritika Sen",
    role: "Training Coordinator",
    monthlyCost: 49000,
    geography: "UP - Banaras",
    photoUrl: portraitUrls[0],
  },
  {
    id: "emp-034",
    name: "Arnav Bhatia",
    role: "Research Associate",
    monthlyCost: 51000,
    geography: "UP - Prayagraj",
    photoUrl: portraitUrls[1],
  },
  {
    id: "emp-035",
    name: "Ishita Agarwal",
    role: "Community Liaison",
    monthlyCost: 42000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[2],
  },
  {
    id: "emp-036",
    name: "Siddharth Mukherjee",
    role: "Data Analyst",
    monthlyCost: 60000,
    geography: "Bihar - Gaya",
    photoUrl: portraitUrls[3],
  },
  {
    id: "emp-037",
    name: "Pritam Saha",
    role: "Partnerships Lead",
    monthlyCost: 71000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[4],
  },
  {
    id: "emp-038",
    name: "Lata Nair",
    role: "Finance Associate",
    monthlyCost: 55000,
    geography: "UP - Lucknow",
    photoUrl: portraitUrls[5],
  },
  {
    id: "emp-039",
    name: "Farhan Ali",
    role: "Field Officer",
    monthlyCost: 44000,
    geography: "UP - Prayagraj",
    photoUrl: portraitUrls[6],
  },
  {
    id: "emp-040",
    name: "Divya Bhatt",
    role: "HR Associate",
    monthlyCost: 47000,
    geography: "Bihar - Muzaffarpur",
    photoUrl: portraitUrls[7],
  },
  {
    id: "emp-041",
    name: "Abhishek Jha",
    role: "Program Manager",
    monthlyCost: 84000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[0],
  },
  {
    id: "emp-042",
    name: "Kirti Desai",
    role: "Outreach Coordinator",
    monthlyCost: 46000,
    geography: "UP - Banaras",
    photoUrl: portraitUrls[1],
  },
  {
    id: "emp-043",
    name: "Naveen Rao",
    role: "Monitoring Specialist",
    monthlyCost: 53000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[2],
  },
  {
    id: "emp-044",
    name: "Seema Kulkarni",
    role: "Community Liaison",
    monthlyCost: 41000,
    geography: "UP - Lucknow",
    photoUrl: portraitUrls[3],
  },
  {
    id: "emp-045",
    name: "Aakash Singh",
    role: "Data Analyst",
    monthlyCost: 62000,
    geography: "Bihar - Gaya",
    photoUrl: portraitUrls[4],
  },
  {
    id: "emp-046",
    name: "Pankhuri Shah",
    role: "Training Coordinator",
    monthlyCost: 49500,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[5],
  },
  {
    id: "emp-047",
    name: "Gaurav Tiwari",
    role: "Field Officer",
    monthlyCost: 43500,
    geography: "UP - Prayagraj",
    photoUrl: portraitUrls[6],
  },
  {
    id: "emp-048",
    name: "Nisha Mathew",
    role: "Partnerships Lead",
    monthlyCost: 68000,
    geography: "Delhi NCR",
    photoUrl: portraitUrls[7],
  },
  {
    id: "emp-049",
    name: "Sahil Chopra",
    role: "Finance Associate",
    monthlyCost: 57000,
    geography: "UP - Banaras",
    photoUrl: portraitUrls[0],
  },
  {
    id: "emp-050",
    name: "Alka Reddy",
    role: "Research Associate",
    monthlyCost: 50500,
    geography: "Bihar - Muzaffarpur",
    photoUrl: portraitUrls[1],
  },
];

const buildJoiningDate = (index: number) => {
  const baseDate = new Date(Date.UTC(2019, 0, 15));
  const nextDate = new Date(baseDate);
  nextDate.setMonth(baseDate.getMonth() + index);

  return nextDate.toISOString().slice(0, 10);
};

const programRotation = programs.map((program) => program.id);

export const employees: Employee[] = rawEmployees.map((employee, index) => {
  const geography =
    geographyLookup[employee.geography] ?? defaultGeography;
  const monthlySalary = employee.monthlyCost;
  const pfContribution = Math.round(monthlySalary * 0.12);
  const tdsDeduction = Math.round(monthlySalary * 0.1);

  return {
    id: employee.id,
    name: employee.name,
    role: employee.role,
    joiningDate: buildJoiningDate(index),
    monthlySalary,
    pfContribution,
    tdsDeduction,
    geography: geography.state,
    city: geography.city,
    programId: programRotation[index % programRotation.length],
    photoUrl: employee.photoUrl,
  };
});
