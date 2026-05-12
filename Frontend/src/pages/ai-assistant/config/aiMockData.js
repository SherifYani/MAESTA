/**
 * @file aiMockData.js
 * @description Mock data for AI Assistant features
 */

export const aiRecommendations = {
    jobs: [
        {
            id: "JOB-001",
            title: "Senior Full Stack Engineer",
            company: "TechVision Solutions",
            location: "Cairo, Egypt",
            salary: "35,000 - 55,000 EGP",
            matchScore: 95,
            skills: ["React", "Node.js", "MongoDB"],
            reason: "Matches your React and Node.js skills perfectly",
            posted: "2 days ago"
        },
        {
            id: "JOB-003",
            title: "Remote Frontend Developer",
            company: "Global Devs",
            location: "Remote",
            salary: "$3,000 - $5,000 / month",
            matchScore: 88,
            skills: ["React", "Redux", "CSS3"],
            reason: "High salary match and remote preference",
            posted: "1 day ago"
        },
        {
            id: "JOB-005",
            title: "Junior Backend Developer",
            company: "StartLink",
            location: "Alexandria",
            salary: "5,000 - 8,000 EGP",
            matchScore: 72,
            skills: ["Python", "Django"],
            reason: "Good entry-level opportunity based on your learning path",
            posted: "Today"
        }
    ],
    candidates: [
        {
            id: "CAND-001",
            name: "Ahmed Hassan",
            title: "Senior React Developer",
            experience: "5 years",
            skills: ["React", "Redux", "TypeScript"],
            matchScore: 94,
            availability: "Immediate",
            photo: "https://via.placeholder.com/150"
        },
        {
            id: "CAND-002",
            name: "Layla Mahfouz",
            title: "Full Stack Engineer",
            experience: "3 years",
            skills: ["React", "Node.js", "Express"],
            matchScore: 89,
            availability: "2 weeks notice",
            photo: "https://via.placeholder.com/150"
        },
        {
            id: "CAND-003",
            name: "Karim Nabil",
            title: "Frontend Specialist",
            experience: "4 years",
            skills: ["Vue.js", "React", "CSS Animals"],
            matchScore: 82,
            availability: "Immediate",
            photo: "https://via.placeholder.com/150"
        }
    ]
};

export const conversationHistory = [
    {
        id: 1,
        sender: "user",
        text: "Can you help me improve my resume?",
        timestamp: "2024-02-06T10:00:00"
    },
    {
        id: 2,
        sender: "ai",
        text: "I'd be happy to help! Please upload your resume or paste the text here, and I can analyze it for improvements, keyword optimization, and formatting tips.",
        timestamp: "2024-02-06T10:00:05"
    },
    {
        id: 3,
        sender: "user",
        text: "I'm looking for a job as a React developer in Cairo.",
        timestamp: "2024-02-06T10:05:00"
    },
    {
        id: 4,
        sender: "ai",
        text: "Great! I found 3 highly relevant React developer jobs in Cairo for you. Would you like to see them?",
        timestamp: "2024-02-06T10:05:02"
    }
];

export const resumeAnalysisResult = {
    score: 85,
    summary: "Strong resume with good technical depth. The layout is clean and easy to read.",
    improvements: [
        "Include more quantifiable metrics in your work experience (e.g., 'Improved load time by 30%').",
        "Add a summary section at the top to highlight your key achievements.",
        "Ensure all date formats are consistent."
    ],
    keywords: {
        found: ["React", "JavaScript", "HTML", "CSS", "Git", "Team Leadership"],
        missing: ["TypeScript", "Next.js", "Testing Credentials"]
    }
};
