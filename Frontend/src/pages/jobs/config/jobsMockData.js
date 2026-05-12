/**
 * @file jobsMockData.js
 * @description Mock data for Jobs features
 */

export const jobsData = [
    {
        _id: "JOB-001",
        title: "Senior Full Stack Engineer",
        company: {
            _id: "COMP-001",
            name: "TechVision Solutions",
            logo: "https://via.placeholder.com/150",
            location: "Cairo, Egypt",
            verified: true
        },
        location: "Maadi, Cairo",
        type: "Full-time",
        workplace: "Hybrid",
        salary: "35,000 - 55,000 EGP",
        description: "We are looking for a Senior Full Stack Engineer to join our growing team. You will responsible for building scalable web applications using React and Node.js.",
        requirements: [
            "5+ years of experience with React and Node.js",
            "Experience with MongoDB and PostgreSQL",
            "Strong understanding of RESTful APIs and Microservices",
            "Excellent problem-solving skills"
        ],
        skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
        postedDate: "2024-02-01T10:00:00Z",
        deadline: "2024-03-01T00:00:00Z",
        applicantsCount: 45,
        isSaved: false,
        status: "active",
        experienceLevel: "Senior",
        category: "Software Development"
    },
    {
        _id: "JOB-002",
        title: "UI/UX Designer",
        company: {
            _id: "COMP-002",
            name: "Creative Pulse",
            logo: "https://via.placeholder.com/150",
            location: "Giza, Egypt",
            verified: true
        },
        location: "Smart Village, Giza",
        type: "Full-time",
        workplace: "On-site",
        salary: "25,000 - 40,000 EGP",
        description: "Creative Pulse is seeking a talented UI/UX Designer to create intuitive and visually appealing user interfaces for our digital products.",
        requirements: [
            "3+ years of experience in UI/UX design",
            "Proficiency in Figma and Adobe Creative Suite",
            "Strong portfolio demonstrating user-centered design",
            "Experience with design systems"
        ],
        skills: ["Figma", "UI Design", "UX Research", "Prototyping", "Adobe XD"],
        postedDate: "2024-02-03T14:30:00Z",
        deadline: "2024-03-10T00:00:00Z",
        applicantsCount: 28,
        isSaved: true,
        status: "active",
        experienceLevel: "Mid-Level",
        category: "Design"
    },
    {
        _id: "JOB-003",
        title: "Remote Frontend Developer",
        company: {
            _id: "COMP-003",
            name: "Global Devs",
            logo: "https://via.placeholder.com/150",
            location: "San Francisco, USA",
            verified: true
        },
        location: "Remote",
        type: "Contract",
        workplace: "Remote",
        salary: "$3,000 - $5,000 / month",
        description: "Join our distributed team building next-gen e-commerce platforms. We need a React expert who can work independently.",
        requirements: [
            "Strong proficiency in React.js and modern CSS",
            "Experience with state management (Redux, Context)",
            "Familiarity with Next.js is a plus",
            "Good English communication skills"
        ],
        skills: ["React", "CSS3", "Redux", "HTML5", "Git"],
        postedDate: "2024-02-05T09:15:00Z",
        deadline: "2024-02-28T00:00:00Z",
        applicantsCount: 156,
        isSaved: false,
        status: "active",
        experienceLevel: "Mid-Level",
        category: "Software Development"
    },
    {
        _id: "JOB-004",
        title: "Marketing Manager",
        company: {
            _id: "COMP-004",
            name: "GrowFast Agency",
            logo: "https://via.placeholder.com/150",
            location: "Nasr City, Cairo",
            verified: false
        },
        location: "Nasr City, Cairo",
        type: "Part-time",
        workplace: "On-site",
        salary: "15,000 - 20,000 EGP",
        description: "We need an experienced Marketing Manager to lead our digital campaigns and improve brand presence.",
        requirements: [
            "Proven experience in digital marketing",
            "Knowledge of SEO/SEM and Google Analytics",
            "Ability to lead a small team",
            "Creative thinking"
        ],
        skills: ["Digital Marketing", "SEO", "Social Media", "Content Strategy"],
        postedDate: "2024-01-28T11:00:00Z",
        deadline: "2024-02-20T00:00:00Z",
        applicantsCount: 12,
        isSaved: false,
        status: "active",
        experienceLevel: "Senior",
        category: "Marketing"
    },
    {
        _id: "JOB-005",
        title: "Junior Backend Developer",
        company: {
            _id: "COMP-005",
            name: "StartLink",
            logo: "https://via.placeholder.com/150",
            location: "Alexandria, Egypt",
            verified: true
        },
        location: "Alexandria",
        type: "Internship",
        workplace: "On-site",
        salary: "5,000 - 8,000 EGP",
        description: "Great opportunity for fresh graduates to learn and grow. You will work on Python/Django backend services.",
        requirements: [
            "Basic knowledge of Python and Django",
            "Understanding of databases (SQL)",
            "Eager to learn and work in a team",
            "CS degree or equivalent"
        ],
        skills: ["Python", "Django", "SQL", "Git"],
        postedDate: "2024-02-06T08:00:00Z",
        deadline: "2024-03-15T00:00:00Z",
        applicantsCount: 89,
        isSaved: false,
        status: "active",
        experienceLevel: "Entry Level",
        category: "Software Development"
    }
];

export const jobCategories = [
    { _id: "CAT-001", name: "Software Development", count: 120 },
    { _id: "CAT-002", name: "Design", count: 45 },
    { _id: "CAT-003", name: "Marketing", count: 32 },
    { _id: "CAT-004", name: "Data Science", count: 18 },
    { _id: "CAT-005", name: "Customer Support", count: 25 },
    { _id: "CAT-006", name: "Sales", count: 40 }
];

export const jobTypes = [
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "remote", label: "Remote" }
];

export const experienceLevels = [
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior Level" },
    { value: "executive", label: "Executive" }
];
