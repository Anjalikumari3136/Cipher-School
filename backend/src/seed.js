const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
require('dotenv').config();

const assignments = [
    {
        title: "Basic Data Retrieval",
        description: "Write a query to retrieve all data from the students table.",
        difficulty: "Easy",
        expectedSchema: { students: ["id", "name", "age", "grade"] },
        solutionQuery: "SELECT * FROM students;",
        order: 1
    },
    {
        title: "Filtering by Age",
        description: "Find all students who are older than 18 years.",
        difficulty: "Easy",
        expectedSchema: { students: ["id", "name", "age", "grade"] },
        solutionQuery: "SELECT * FROM students WHERE age > 18;",
        order: 2
    },
    {
        title: "Specific Columns",
        description: "Only retrieve the 'name' and 'grade' of all students.",
        difficulty: "Easy",
        expectedSchema: { students: ["name", "grade"] },
        solutionQuery: "SELECT name, grade FROM students;",
        order: 3
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        await Assignment.deleteMany({});
        await Assignment.insertMany(assignments);

        console.log('✅ Database Seeded Successfully with 3 Assignments!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
