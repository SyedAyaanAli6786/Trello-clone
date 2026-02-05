import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create labels
    const labels = await Promise.all([
        prisma.label.create({ data: { name: 'Bug', color: '#eb5a46' } }),
        prisma.label.create({ data: { name: 'Feature', color: '#61bd4f' } }),
        prisma.label.create({ data: { name: 'Design', color: '#f2d600' } }),
        prisma.label.create({ data: { name: 'Documentation', color: '#0079bf' } }),
        prisma.label.create({ data: { name: 'High Priority', color: '#c377e0' } }),
        prisma.label.create({ data: { name: 'Low Priority', color: '#00c2e0' } }),
    ]);
    console.log('✅ Created labels');

    // Create members
    const members = await Promise.all([
        prisma.member.create({
            data: {
                name: 'John Doe',
                email: 'john@example.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
            },
        }),
        prisma.member.create({
            data: {
                name: 'Jane Smith',
                email: 'jane@example.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Smith&background=61BD4F&color=fff',
            },
        }),
        prisma.member.create({
            data: {
                name: 'Bob Johnson',
                email: 'bob@example.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=F2D600&color=000',
            },
        }),
        prisma.member.create({
            data: {
                name: 'Alice Williams',
                email: 'alice@example.com',
                avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Williams&background=EB5A46&color=fff',
            },
        }),
    ]);
    console.log('✅ Created members');

    // Create board
    const board = await prisma.board.create({
        data: {
            title: 'Project Management Board',
            backgroundColor: '#0079bf',
        },
    });
    console.log('✅ Created board');

    // Create lists
    const todoList = await prisma.list.create({
        data: {
            boardId: board.id,
            title: 'To Do',
            position: 0,
        },
    });

    const inProgressList = await prisma.list.create({
        data: {
            boardId: board.id,
            title: 'In Progress',
            position: 1,
        },
    });

    const reviewList = await prisma.list.create({
        data: {
            boardId: board.id,
            title: 'Review',
            position: 2,
        },
    });

    const doneList = await prisma.list.create({
        data: {
            boardId: board.id,
            title: 'Done',
            position: 3,
        },
    });
    console.log('✅ Created lists');

    // Create cards in To Do list
    const card1 = await prisma.card.create({
        data: {
            listId: todoList.id,
            title: 'Design new landing page',
            description: 'Create mockups for the new landing page with modern design',
            position: 0,
            dueDate: new Date('2026-02-10'),
            cardLabels: {
                create: [{ labelId: labels[2].id }], // Design
            },
            cardMembers: {
                create: [{ memberId: members[1].id }], // Jane
            },
            checklistItems: {
                create: [
                    { title: 'Research competitors', completed: true, position: 0 },
                    { title: 'Create wireframes', completed: false, position: 1 },
                    { title: 'Design mockups', completed: false, position: 2 },
                ],
            },
        },
    });

    const card2 = await prisma.card.create({
        data: {
            listId: todoList.id,
            title: 'Fix authentication bug',
            description: 'Users are unable to login with Google OAuth',
            position: 1,
            dueDate: new Date('2026-02-05'),
            cardLabels: {
                create: [
                    { labelId: labels[0].id }, // Bug
                    { labelId: labels[4].id }, // High Priority
                ],
            },
            cardMembers: {
                create: [{ memberId: members[0].id }], // John
            },
        },
    });

    // Create cards in In Progress list
    const card3 = await prisma.card.create({
        data: {
            listId: inProgressList.id,
            title: 'Implement drag and drop',
            description: 'Add drag and drop functionality for cards and lists',
            position: 0,
            cardLabels: {
                create: [{ labelId: labels[1].id }], // Feature
            },
            cardMembers: {
                create: [
                    { memberId: members[0].id }, // John
                    { memberId: members[2].id }, // Bob
                ],
            },
            checklistItems: {
                create: [
                    { title: 'Install react-beautiful-dnd', completed: true, position: 0 },
                    { title: 'Implement list drag and drop', completed: true, position: 1 },
                    { title: 'Implement card drag and drop', completed: false, position: 2 },
                    { title: 'Test on mobile devices', completed: false, position: 3 },
                ],
            },
        },
    });

    // Create cards in Review list
    const card4 = await prisma.card.create({
        data: {
            listId: reviewList.id,
            title: 'Update API documentation',
            description: 'Add documentation for new endpoints',
            position: 0,
            cardLabels: {
                create: [{ labelId: labels[3].id }], // Documentation
            },
            cardMembers: {
                create: [{ memberId: members[3].id }], // Alice
            },
        },
    });

    // Create cards in Done list
    const card5 = await prisma.card.create({
        data: {
            listId: doneList.id,
            title: 'Setup CI/CD pipeline',
            description: 'Configure GitHub Actions for automated deployment',
            position: 0,
            cardLabels: {
                create: [{ labelId: labels[1].id }], // Feature
            },
            cardMembers: {
                create: [{ memberId: members[2].id }], // Bob
            },
            checklistItems: {
                create: [
                    { title: 'Setup GitHub Actions', completed: true, position: 0 },
                    { title: 'Configure deployment', completed: true, position: 1 },
                    { title: 'Test pipeline', completed: true, position: 2 },
                ],
            },
        },
    });

    const card6 = await prisma.card.create({
        data: {
            listId: doneList.id,
            title: 'Database schema design',
            description: 'Design and implement database schema for the application',
            position: 1,
            cardLabels: {
                create: [{ labelId: labels[1].id }], // Feature
            },
            cardMembers: {
                create: [
                    { memberId: members[0].id }, // John
                    { memberId: members[1].id }, // Jane
                ],
            },
        },
    });

    console.log('✅ Created cards with labels, members, and checklist items');
    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
