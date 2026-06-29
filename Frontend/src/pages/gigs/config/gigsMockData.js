/**
 * @file gigsMockData.js
 * @description Mock data for Gigs features
 */

export const gigsData = [
    {
        id: "GIG-001",
        title: "Redesign E-commerce Website Homepage",
        description: "I need a modern, responsive redesign for my Shopify store homepage. The current design is outdated and not mobile-friendly. I have references for the style I want.",
        client: {
            id: "CLIENT-001",
            name: "Sarah Miller",
            avatar: "https://via.placeholder.com/150",
            rating: 4.8,
            jobsPosted: 12,
            verified: true
        },
        budget: { min: 500, max: 1000, currency: "USD" },
        duration: "1-3 months",
        skills: ["Web Design", "Shopify", "UI/UX", "CSS"],
        requiredSkills: ["Web Design", "Shopify", "UI/UX", "CSS", "Responsive Design"],
        milestones: [
            { id: "M1", description: "Initial Design Concepts", amount: 200, deadline: "2024-02-10", status: "pending" },
            { id: "M2", description: "Homepage Implementation", amount: 500, deadline: "2024-02-18", status: "pending" },
            { id: "M3", description: "Mobile Responsiveness & Final Polish", amount: 300, deadline: "2024-02-25", status: "pending" }
        ],
        qna: [
            {
                id: "Q1",
                question: "Do you have specific brand guidelines?",
                answer: "Yes, I will provide a brand book with colors and fonts upon hiring.",
                asker: "John Doe",
                date: "2024-02-05T14:30:00Z"
            }
        ],
        postedDate: "2024-02-04T12:00:00Z",
        deadline: "2024-02-20T00:00:00Z",
        proposalsCount: 8,
        status: "open",
        category: "Design",
        experienceLevel: "Intermediate"
    },
    {
        id: "GIG-002",
        title: "Build a Custom Chatbot for Telegram",
        description: "Looking for a Python developer to build a Telegram bot that can handle customer queries, integrate with Stripe for payments, and manage user subscriptions.",
        client: {
            id: "CLIENT-002",
            name: "TechStart Inc",
            avatar: "https://via.placeholder.com/150",
            rating: 5.0,
            jobsPosted: 45,
            verified: true
        },
        budget: { min: 1000, max: 2000, currency: "USD" },
        duration: "Less than 1 month",
        skills: ["Python", "Telegram API", "Stripe API", "Bot Development"],
        requiredSkills: ["Python", "Telegram API", "Stripe API", "Bot Development", "PostgreSQL"],
        milestones: [
            { id: "M1", description: "Bot Setup & Basic Commands", amount: 500, deadline: "2024-02-12", status: "pending" },
            { id: "M2", description: "Stripe Integration", amount: 800, deadline: "2024-02-20", status: "pending" },
            { id: "M3", description: "Testing & Deployment", amount: 700, deadline: "2024-02-28", status: "pending" }
        ],
        qna: [],
        postedDate: "2024-02-05T09:00:00Z",
        deadline: "2024-02-15T00:00:00Z",
        proposalsCount: 15,
        status: "open",
        category: "Development",
        experienceLevel: "Expert"
    },
    {
        id: "GIG-003",
        title: "Write SEO Blog Posts for Travel Niche",
        description: "Need a skilled content writer to produce 10 SEO-optimized blog posts for a travel website. Topics include 'Budget Travel in Europe', 'Best Solo Destinations', etc.",
        client: {
            id: "CLIENT-003",
            name: "Wanderlust Blog",
            avatar: "https://via.placeholder.com/150",
            rating: 4.5,
            jobsPosted: 3,
            verified: false
        },
        budget: { min: 100, max: 300, currency: "USD" },
        duration: "Less than 1 month",
        skills: ["Content Writing", "SEO", "Travel Writing", "Blog Writing"],
        requiredSkills: ["Content Writing", "SEO", "Travel Writing", "English Proficiency"],
        milestones: [
            { id: "M1", description: "First 5 Articles", amount: 150, deadline: "2024-02-15", status: "pending" },
            { id: "M2", description: "Remaining 5 Articles", amount: 150, deadline: "2024-02-22", status: "pending" }
        ],
        qna: [
            {
                id: "Q1",
                question: "What is the expected word count per article?",
                answer: "Around 1000-1500 words per article.",
                asker: "Alice Writer",
                date: "2024-02-06T11:00:00Z"
            }
        ],
        postedDate: "2024-02-06T10:30:00Z",
        deadline: "2024-02-12T00:00:00Z",
        proposalsCount: 22,
        status: "open",
        category: "Writing",
        experienceLevel: "Entry"
    },
    {
        id: "GIG-004",
        title: "Video Editor for YouTube Channel",
        description: "Looking for a video editor to edit weekly vlogs. Raw footage is around 30 mins, needs cut down to 10-12 mins with music, transitions, and basic color correction.",
        client: {
            id: "CLIENT-004",
            name: "Mike Vlogs",
            avatar: "https://via.placeholder.com/150",
            rating: 4.9,
            jobsPosted: 8,
            verified: true
        },
        budget: { min: 50, max: 150, currency: "USD" },
        duration: "Ongoing",
        skills: ["Adobe Premiere", "Video Editing", "YouTube", "Color Grading"],
        requiredSkills: ["Adobe Premiere", "Video Editing", "Sound Design", "Color Grading"],
        milestones: [],
        qna: [],
        postedDate: "2024-02-02T15:00:00Z",
        deadline: "2024-02-28T00:00:00Z",
        proposalsCount: 5,
        status: "open",
        category: "Video & Animation",
        experienceLevel: "Intermediate"
    },
    {
        id: "GIG-005",
        title: "Mobile App Logo Design",
        description: "I need a clean, minimalist logo for a new fitness mobile app. The theme is energy and health. Need vector files and different variations.",
        client: {
            id: "CLIENT-005",
            name: "FitLife App",
            avatar: "https://via.placeholder.com/150",
            rating: 4.2,
            jobsPosted: 1,
            verified: true
        },
        budget: { min: 200, max: 400, currency: "USD" },
        duration: "Less than 1 month",
        skills: ["Logo Design", "Illustrator", "Branding", "Graphic Design"],
        requiredSkills: ["Logo Design", "Adobe Illustrator", "Vector Graphics", "Creative Direction"],
        milestones: [
            { id: "M1", description: "Initial Concepts (3 variations)", amount: 100, deadline: "2024-02-08", status: "pending" },
            { id: "M2", description: "Final Logo & Source Files", amount: 200, deadline: "2024-02-10", status: "pending" }
        ],
        qna: [],
        postedDate: "2024-02-06T11:45:00Z",
        deadline: "2024-02-10T00:00:00Z",
        proposalsCount: 12,
        status: "open",
        category: "Design",
        experienceLevel: "Intermediate"
    }
];

export const gigCategories = [
    { id: "CAT-G01", name: "Development", count: 85 },
    { id: "CAT-G02", name: "Design", count: 64 },
    { id: "CAT-G03", name: "Writing", count: 42 },
    { id: "CAT-G04", name: "Marketing", count: 28 },
    { id: "CAT-G05", name: "Video & Animation", count: 15 },
    { id: "CAT-G06", name: "Business", count: 10 }
];

export const gigSkills = [
    "React", "Node.js", "Python", "WordPress", "Shopify",
    "Graphic Design", "Logo Design", "UI/UX",
    "Content Writing", "SEO", "Copywriting",
    "Video Editing", "Animation", "Voice Over",
    "Social Media Marketing", "Email Marketing"
];
