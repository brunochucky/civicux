const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Clean up existing data (optional, be careful in prod)
    // await prisma.vote.deleteMany();
    // await prisma.report.deleteMany();
    // await prisma.user.deleteMany();
    // await prisma.achievement.deleteMany();

    // 2. Seed Achievements
    const achievements = [
        { id: 'first-report', title: 'Olho de Águia', description: 'Fez sua primeira denúncia.', icon: '🦅' },
        { id: 'five-reports', title: 'Vigilante', description: 'Enviou 5 denúncias.', icon: '👀' },
        { id: 'five-votes-report', title: 'Juiz Imparcial', description: 'Votou em 5 denúncias.', icon: '⚖️' },
        { id: 'first-prop-vote', title: 'Legislador', description: 'Votou em 1 projeto de lei.', icon: '📜' },
        { id: 'five-prop-votes', title: 'Senador', description: 'Votou em 5 projetos de lei.', icon: '🏛️' }
    ];

    for (const ach of achievements) {
        await prisma.achievement.upsert({
            where: { id: ach.id },
            update: {},
            create: ach,
        });
    }
    console.log('✅ Achievements seeded');

    // 3. Seed Users
    const passwordHash = await bcrypt.hash('senha123', 10);

    const usersData = [
        {
            email: 'cidadao@exemplo.com',
            name: 'Bruno Ferreira',
            password: passwordHash,
            level: 8,
            xp: 2450,
            civiCoins: 500,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chucky666'
        },
        {
            email: 'maria@email.com',
            name: 'Maria Silva',
            password: passwordHash,
            level: 5,
            xp: 1200,
            civiCoins: 250,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
        },
        {
            email: 'joao@email.com',
            name: 'João Souza',
            password: passwordHash,
            level: 2,
            xp: 450,
            civiCoins: 100,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao'
        }
    ];

    const users = [];
    for (const u of usersData) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: u,
        });
        users.push(user);
    }
    console.log('✅ Users seeded');

    // 4. Seed Reports
    const reportsData = [
        {
            title: 'Buraco na Via Principal',
            description: 'Um buraco enorme se abriu na faixa da direita, causando perigo aos motoristas.',
            severity: 8,
            department: 'Infraestrutura',
            latitude: -23.5613,
            longitude: -46.6563,
            address: 'Avenida Paulista, 1578, Bela Vista, São Paulo, SP',
            imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
            status: 'pending',
            authorId: users[0].id
        },
        {
            title: 'Lixo acumulado na calçada',
            description: 'Sacos de lixo rasgados e espalhados pela calçada há 3 dias.',
            severity: 6,
            department: 'Limpeza Urbana',
            latitude: -23.5505,
            longitude: -46.6333,
            address: 'Praça da Sé, Centro, São Paulo, SP',
            imageUrl: 'https://images.unsplash.com/photo-1759401654832-ab2e73a14336?auto=format&fit=crop&q=80&w=800',
            status: 'validated',
            authorId: users[1].id
        },
        {
            title: 'Iluminação pública defeituosa',
            description: 'Poste de luz piscando intermitentemente, deixando a rua escura.',
            severity: 4,
            department: 'Iluminação',
            latitude: -23.5987,
            longitude: -46.6765,
            address: 'Rua Funchal, Vila Olímpia, São Paulo, SP',
            imageUrl: 'https://images.unsplash.com/photo-1485599352433-e476c850f2a9?auto=format&fit=crop&q=80&w=800',
            status: 'pending',
            authorId: users[2].id
        },
        {
            title: 'Sinalização de trânsito caída',
            description: 'Placa de Pare caída no chão após tempestade.',
            severity: 5,
            department: 'Trânsito',
            latitude: -23.5678,
            longitude: -46.6456,
            address: 'Rua Treze de Maio, Bela Vista, São Paulo, SP',
            imageUrl: 'https://images.unsplash.com/photo-1642459124650-945b9bbce4ed?auto=format&fit=crop&q=80&w=800',
            status: 'pending',
            authorId: users[0].id
        }
    ];

    for (const r of reportsData) {
        // Check if report exists to avoid duplicates on multiple runs (simple check by title/author)
        const existing = await prisma.report.findFirst({
            where: { title: r.title, authorId: r.authorId }
        });

        if (!existing) {
            await prisma.report.create({ data: r });
        }
    }
    console.log('✅ Reports seeded');

    // 5. Seed Additional Users for more dynamic ranking
    const additionalUsersData = [
        {
            email: 'ana@email.com',
            name: 'Ana Costa',
            password: passwordHash,
            level: 7,
            xp: 1850,
            civiCoins: 420,
            reportsSubmitted: 12,
            votesCast: 45,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
        },
        {
            email: 'carlos@email.com',
            name: 'Carlos Oliveira',
            password: passwordHash,
            level: 6,
            xp: 1550,
            civiCoins: 350,
            reportsSubmitted: 8,
            votesCast: 38,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
        },
        {
            email: 'fernanda@email.com',
            name: 'Fernanda Lima',
            password: passwordHash,
            level: 4,
            xp: 980,
            civiCoins: 220,
            reportsSubmitted: 6,
            votesCast: 25,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda'
        },
        {
            email: 'pedro@email.com',
            name: 'Pedro Santos',
            password: passwordHash,
            level: 3,
            xp: 720,
            civiCoins: 180,
            reportsSubmitted: 4,
            votesCast: 18,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro'
        },
        {
            email: 'juliana@email.com',
            name: 'Juliana Ferreira',
            password: passwordHash,
            level: 9,
            xp: 3200,
            civiCoins: 680,
            reportsSubmitted: 18,
            votesCast: 67,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana'
        },
        {
            email: 'ricardo@email.com',
            name: 'Ricardo Mendes',
            password: passwordHash,
            level: 3,
            xp: 650,
            civiCoins: 150,
            reportsSubmitted: 3,
            votesCast: 15,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo'
        },
        {
            email: 'luciana@email.com',
            name: 'Luciana Rocha',
            password: passwordHash,
            level: 5,
            xp: 1320,
            civiCoins: 290,
            reportsSubmitted: 7,
            votesCast: 31,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luciana'
        }
    ];

    const allUsers = [...users]; // Keep existing users
    for (const u of additionalUsersData) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: u,
        });
        allUsers.push(user);
    }
    console.log('✅ Additional users seeded');

    // 6. Seed Validation Votes
    // Get all existing reports to vote on
    const allReports = await prisma.report.findMany();

    if (allReports.length > 0) {
        const votesData = [];

        // Create diverse voting patterns
        for (let i = 0; i < allUsers.length; i++) {
            const user = allUsers[i];

            // Each user votes on 3-5 random reports
            const numVotes = Math.floor(Math.random() * 3) + 3; // 3-5 votes
            const reportIndices = [];

            // Select random unique reports
            while (reportIndices.length < Math.min(numVotes, allReports.length)) {
                const idx = Math.floor(Math.random() * allReports.length);
                const report = allReports[idx];

                // Don't vote on own reports
                if (report.authorId !== user.id && !reportIndices.includes(idx)) {
                    reportIndices.push(idx);

                    // Check if vote already exists
                    const existingVote = await prisma.vote.findUnique({
                        where: {
                            userId_reportId: {
                                userId: user.id,
                                reportId: report.id
                            }
                        }
                    });

                    if (!existingVote) {
                        const type = Math.random() > 0.3 ? 'valid' : 'fake'; // 70% valid, 30% fake
                        votesData.push({
                            userId: user.id,
                            reportId: report.id,
                            type,
                            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random within last 7 days
                        });
                    }
                }
            }
        }

        // Create votes
        for (const vote of votesData) {
            await prisma.vote.create({ data: vote });
        }

        console.log(`✅ ${votesData.length} validation votes seeded`);
    }

    console.log('🌱 Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
