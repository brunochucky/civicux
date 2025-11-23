require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Configure multer for image uploads (memory storage for Vercel)
const multer = require('multer');
const supabase = require('./supabase');

// Use memory storage instead of disk (Vercel has read-only filesystem)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Serve uploaded images statically
// Serve uploaded images statically - DISABLED (Using Supabase Storage)
// app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// --- Seeding ---

const achievementsList = [
    { id: 'first-report', title: 'Olho de Águia', description: 'Fez sua primeira denúncia.', icon: '🦅' },
    { id: 'five-reports', title: 'Vigilante', description: 'Enviou 5 denúncias.', icon: '👀' },
    { id: 'five-votes-report', title: 'Juiz Imparcial', description: 'Votou em 5 denúncias.', icon: '⚖️' },
    { id: 'first-prop-vote', title: 'Legislador', description: 'Votou em 1 projeto de lei.', icon: '📜' },
    { id: 'five-prop-votes', title: 'Senador', description: 'Votou em 5 projetos de lei.', icon: '🏛️' }
];

async function seedAchievements() {
    for (const ach of achievementsList) {
        await prisma.achievement.upsert({
            where: { id: ach.id },
            update: {},
            create: ach
        });
    }
    console.log('Achievements seeded');
}

seedAchievements();

async function checkAchievements(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { achievements: true }
    });

    if (!user) return;

    const unlockedIds = new Set(user.achievements.map(ua => ua.achievementId));
    const newAchievements = [];

    // Count specific actions
    const reportCount = await prisma.report.count({ where: { authorId: userId } });
    const reportVoteCount = await prisma.vote.count({ where: { userId } });
    const propVoteCount = await prisma.propositionVote.count({ where: { userId } });

    // Define rules
    const rules = [
        { id: 'first-report', condition: reportCount >= 1 },
        { id: 'five-reports', condition: reportCount >= 5 },
        { id: 'five-votes-report', condition: reportVoteCount >= 5 },
        { id: 'first-prop-vote', condition: propVoteCount >= 1 },
        { id: 'five-prop-votes', condition: propVoteCount >= 5 }
    ];

    for (const rule of rules) {
        if (rule.condition && !unlockedIds.has(rule.id)) {
            await prisma.userAchievement.create({
                data: { userId, achievementId: rule.id }
            });
            newAchievements.push(rule.id);
        }
    }

    if (newAchievements.length > 0) {
        console.log(`User ${userId} unlocked: ${newAchievements.join(', ')}`);
    }
}

// --- Auth Middleware ---

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// --- Auth Routes ---

// Login endpoint - verify email and password
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        // Don't send password to client
        const { password: _, ...userWithoutPassword } = user;
        res.json({ ...userWithoutPassword, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

// Register endpoint - create new user with hashed password
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
            },
        });

        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        // Don't send password to client
        const { password: _, ...userWithoutPassword } = user;
        res.json({ ...userWithoutPassword, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
});

app.get('/api/user/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                achievements: { include: { achievement: true } },
                reports: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                votes: {
                    include: { report: true },
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                propositionVotes: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove sensitive data
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Failed to fetch user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user profile (name and/or password)
app.put('/api/user/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            currentPassword,
            newPassword,
            address,
            education,
            profession,
            age,
            whatsapp,
            receiveUpdates,
            notificationChannel,
            interests,
            subscribedThemes
        } = req.body;

        // Ensure user is updating their own profile
        if (req.user.id !== id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prepare update data
        const updateData = {};

        // Update name if provided
        if (name && name.trim()) {
            updateData.name = name.trim();
        }

        // Update optional profile fields
        if (address !== undefined) updateData.address = address;
        if (education !== undefined) updateData.education = education;
        if (profession !== undefined) updateData.profession = profession;
        if (age !== undefined) updateData.age = parseInt(age);
        if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
        if (receiveUpdates !== undefined) updateData.receiveUpdates = receiveUpdates;
        if (notificationChannel !== undefined) updateData.notificationChannel = notificationChannel;
        if (interests !== undefined) updateData.interests = interests;
        if (subscribedThemes !== undefined) updateData.subscribedThemes = subscribedThemes;

        // Update password if new password provided
        if (newPassword) {
            // Verify current password is provided
            if (!currentPassword) {
                return res.status(400).json({ error: 'Senha atual é obrigatória para alterar a senha' });
            }

            // Verify current password matches
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Senha atual incorreta' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData
        });

        // Don't send password to client
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Failed to update user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.get('/api/ranking', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            take: 50,
            orderBy: { xp: 'desc' },
            select: {
                id: true,
                name: true,
                xp: true,
                level: true,
                avatar: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching ranking:', error);
        res.status(500).json({ error: 'Failed to fetch ranking' });
    }
});

// --- Image Upload Route ---

app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Generate unique filename
        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({ error: 'Failed to upload to storage' });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);

        res.json({ imageUrl: publicUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// --- Report Routes ---

app.get('/api/reports', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const userId = req.query.userId; // Optional userId for vote status

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                include: {
                    votes: true,
                    author: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.report.count()
        ]);

        // Enrich with user vote status if userId provided
        let enrichedReports = reports;
        if (userId) {
            enrichedReports = reports.map(report => {
                const userVote = report.votes.find(v => v.userId === userId);
                return {
                    ...report,
                    userVote: userVote?.type || null // 'valid', 'fake', or null
                };
            });
        }

        const totalPages = Math.ceil(total / limit);
        const nextPage = page < totalPages ? page + 1 : null;

        res.json({
            items: enrichedReports,
            page,
            totalPages,
            nextPage,
            total
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

app.post('/api/reports', async (req, res) => {
    const { title, description, severity, department, location, address, imageUrl, authorId } = req.body;
    try {
        const report = await prisma.report.create({
            data: {
                title,
                description,
                severity,
                department,
                imageUrl,
                address,
                latitude: location.lat,
                longitude: location.lng,
                authorId,
            },
        });

        // Award XP and Coins (Simple logic for now)
        await prisma.user.update({
            where: { id: authorId },
            data: {
                xp: { increment: 100 },
                civiCoins: { increment: 50 },
                reportsSubmitted: { increment: 1 },
            },
        });

        await checkAchievements(authorId);

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create report' });
    }
});

app.post('/api/reports/:id/vote', async (req, res) => {
    const { userId, type, comment } = req.body;
    const { id } = req.params;
    try {
        const vote = await prisma.vote.create({
            data: {
                type,
                comment: comment || null, // Save comment if provided
                userId,
                reportId: id,
            },
        });

        // Award Coins for voting
        await prisma.user.update({
            where: { id: userId },
            data: {
                civiCoins: { increment: 10 },
                votesCast: { increment: 1 },
            },
        });

        await checkAchievements(userId);

        res.json(vote);
    } catch (error) {
        res.status(500).json({ error: 'Failed to vote' });
    }
});

// --- Proposition Routes ---

app.get('/api/propositions', async (req, res) => {
    try {
        const userId = req.query.userId;
        const page = parseInt(req.query.page) || parseInt(req.query.pagina) || 1;
        const limit = parseInt(req.query.limit) || parseInt(req.query.itens) || 5;

        // Fetch from Câmara API
        const axios = require('axios');
        const response = await axios.get('https://dadosabertos.camara.leg.br/api/v2/proposicoes', {
            params: {
                siglaTipo: 'PL',
                ano: 2024,
                ordem: 'DESC',
                ordenarPor: 'id',
                pagina: page,
                itens: limit
            }
        });

        // Enrich with local vote data if needed
        let propositions = response.data.dados;

        // Fetch authors for the current page propositions
        const propositionsWithAuthors = await Promise.all(propositions.map(async (prop) => {
            try {
                const authorResponse = await axios.get(`https://dadosabertos.camara.leg.br/api/v2/proposicoes/${prop.id}/autores`);
                const authors = authorResponse.data.dados;
                if (authors && authors.length > 0) {
                    const mainAuthor = authors[0];
                    const authorName = mainAuthor.nome;
                    const partyInfo = mainAuthor.siglaPartido
                        ? `${mainAuthor.siglaPartido}/${mainAuthor.siglaUf}`
                        : '';

                    prop.author = partyInfo ? `${authorName} - ${partyInfo}` : authorName;
                }
            } catch (err) {
                console.error(`Failed to fetch author for prop ${prop.id}`, err.message);
            }
            return prop;
        }));

        propositions = propositionsWithAuthors;

        if (userId) {
            const userVotes = await prisma.propositionVote.findMany({
                where: { userId: String(userId) }
            });

            const voteMap = new Map(userVotes.map(v => [v.propositionId, v.voteType]));

            propositions = propositions.map(prop => ({
                ...prop,
                userVote: voteMap.get(String(prop.id)) || null
            }));
        }

        res.json(propositions);
    } catch (error) {
        console.error('Error fetching propositions:', error);
        res.status(500).json({ error: 'Failed to fetch propositions' });
    }
});

app.post('/api/propositions/vote', async (req, res) => {
    const { userId, propositionId, voteType, comment } = req.body;
    const propositionIdString = String(propositionId);

    try {
        // Check if already voted
        const existingVote = await prisma.propositionVote.findUnique({
            where: {
                userId_propositionId: {
                    userId,
                    propositionId: propositionIdString
                }
            }
        });

        if (existingVote) {
            return res.status(400).json({ error: 'Você já votou nesta proposição.' });
        }

        const vote = await prisma.propositionVote.create({
            data: {
                userId,
                propositionId: propositionIdString,
                voteType,
                comment
            }
        });

        // Award CiviCoins and XP
        await prisma.user.update({
            where: { id: userId },
            data: {
                civiCoins: { increment: 1 },
                xp: { increment: 10 },
                votesCast: { increment: 1 }
            }
        });

        await checkAchievements(userId);

        res.json(vote);
    } catch (error) {
        console.error('Error voting on proposition:', error);
        res.status(500).json({ error: 'Failed to submit vote' });
    }
});

// --- Activity Routes ---

app.get('/api/activity', async (req, res) => {
    try {
        // Fetch recent reports
        const reports = await prisma.report.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { author: true }
        });

        // Fetch recent proposition votes
        const propVotes = await prisma.propositionVote.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });

        // Normalize and merge
        const activity = [
            ...reports.map(r => ({
                id: r.id,
                type: 'REPORT',
                title: r.title,
                description: r.description,
                date: r.createdAt,
                location: 'São Paulo', // Placeholder
                status: r.status,
                user: r.author.name,
                icon: 'Camera'
            })),
            ...propVotes.map(v => ({
                id: v.id,
                type: 'PROP_VOTE',
                title: `Voto em Proposta #${v.propositionId}`,
                description: `Votou ${v.voteType === 'APPROVE' ? 'A favor' : 'Contra'}`,
                date: v.createdAt,
                location: 'Câmara Municipal',
                status: 'COMPUTADO',
                user: v.user.name,
                icon: 'Vote'
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// --- DOU Routes ---

app.get('/api/dou', async (req, res) => {
    try {
        const axios = require('axios');
        const cheerio = require('cheerio');
        const page = parseInt(req.query.page) || 1;

        const baseUrl = 'https://www.in.gov.br/servicos/diario-oficial-da-uniao/destaques-do-diario-oficial-da-uniao';
        const params = new URLSearchParams({
            p_p_id: 'com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_mhF1RLPnJWPh',
            p_p_lifecycle: '0',
            p_p_state: 'normal',
            p_p_mode: 'view',
            _com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_mhF1RLPnJWPh_delta: '20',
            p_r_p_resetCur: 'false',
            _com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_mhF1RLPnJWPh_cur: page
        });

        const targetUrl = `${baseUrl}?${params.toString()}`;
        const response = await axios.get(targetUrl);
        const $ = cheerio.load(response.data);

        const highlights = [];

        // User provided selector: .lista-de-dou .dou
        $('.lista-de-dou .dou').each((i, el) => {
            const tag = $(el).find('.tag').text().trim();
            const titleEl = $(el).find('.title');
            const title = titleEl.text().trim();
            const link = titleEl.attr('href');
            const summary = $(el).find('.summary').text().trim();
            const date = $(el).find('.date').text().trim();

            if (title && link) {
                highlights.push({
                    id: i + ((page - 1) * 20), // Offset ID based on page
                    tag,
                    title,
                    link: link.startsWith('http') ? link : `https://www.in.gov.br${link}`,
                    summary,
                    date: date || new Date().toLocaleDateString('pt-BR')
                });
            }
        });

        // Calculate total pages from the last pagination link
        let totalPages = page;

        // Use the selector that works: [class*="pagination"]
        const lastLink = $('[class*="pagination"] a').last();
        const lastHref = lastLink.attr('href');

        if (lastHref) {
            const match = lastHref.match(/_cur=(\d+)/);
            if (match && match[1]) {
                totalPages = parseInt(match[1]);
            }
        }

        const nextPage = (page < totalPages) ? page + 1 : null;

        // Remove duplicates based on title
        const uniqueHighlights = Array.from(new Map(highlights.map(item => [item.title, item])).values());

        res.json({
            items: uniqueHighlights,
            nextPage,
            totalPages
        });
    } catch (error) {
        console.error('Error fetching DOU:', error);
        res.status(500).json({ error: 'Failed to fetch DOU highlights' });
    }
});

app.post('/api/dou/summarize', async (req, res) => {
    const { text, url } = req.body;

    try {
        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        let contentToSummarize = text;

        if (url) {
            const axios = require('axios');
            const cheerio = require('cheerio');
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            // Try to extract main content
            contentToSummarize = $('.journal-content-article').text().trim() || $('body').text().trim();
            // Truncate to avoid token limits
            contentToSummarize = contentToSummarize.substring(0, 5000);
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Você é um assistente jurídico útil. Resuma a seguinte matéria do Diário Oficial da União em português claro e simples para um cidadão comum. Destaque o impacto prático."
                },
                {
                    role: "user",
                    content: contentToSummarize
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 500,
        });

        res.json({ summary: chatCompletion.choices[0]?.message?.content || "Não foi possível gerar o resumo." });
    } catch (error) {
        console.error('Error summarizing:', error);
        res.status(500).json({ error: 'Failed to summarize' });
    }
});

app.post('/api/propositions/summarize', async (req, res) => {
    const { text, type, number, year, author } = req.body;

    try {
        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Você é um consultor legislativo experiente. Analise a seguinte proposição legislativa e crie um resumo estruturado para um cidadão comum.\n\nUse formatação Markdown:\n- **O que é**: Uma explicação simples.\n- **Autor**: Mencione o autor e partido (se fornecido).\n- **Mudanças principais**: O que muda na lei atual.\n- **Prós e Contras**: Pontos positivos e negativos.\n- **🇧🇷 Como isso afeta a vida do brasileiro**: Seção obrigatória explicando o impacto prático no dia a dia.\n\nSeja imparcial e claro."
                },
                {
                    role: "user",
                    content: `Proposição: ${type} ${number}/${year}\nAutor: ${author || 'Não informado'}\n\nTexto/Ementa: ${text}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 800,
        });

        res.json({ summary: chatCompletion.choices[0]?.message?.content || "Não foi possível gerar o resumo." });
    } catch (error) {
        console.error('Error summarizing proposition:', error);
        res.status(500).json({ error: 'Failed to summarize' });
    }
});

app.post('/api/propositions/vote', async (req, res) => {
    const { userId, propositionId, voteType, comment } = req.body;
    const propositionIdString = String(propositionId);

    try {
        // Check if already voted
        const existingVote = await prisma.propositionVote.findUnique({
            where: {
                userId_propositionId: {
                    userId,
                    propositionId: propositionIdString
                }
            }
        });

        if (existingVote) {
            return res.status(400).json({ error: 'Você já votou nesta proposição.' });
        }

        const vote = await prisma.propositionVote.create({
            data: {
                userId,
                propositionId: propositionIdString,
                voteType,
                comment
            }
        });

        // Award CiviCoins and XP
        await prisma.user.update({
            where: { id: userId },
            data: {
                civiCoins: { increment: 1 },
                xp: { increment: 10 },
                votesCast: { increment: 1 }
            }
        });

        await checkAchievements(userId);

        res.json(vote);
    } catch (error) {
        console.error('Error voting on proposition:', error);
        res.status(500).json({ error: 'Failed to submit vote' });
    }
});

// --- Activity Routes ---

app.get('/api/activity', async (req, res) => {
    try {
        // Fetch recent reports
        const reports = await prisma.report.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { author: true }
        });

        // Fetch recent proposition votes
        const propVotes = await prisma.propositionVote.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });

        // Normalize and merge
        const activity = [
            ...reports.map(r => ({
                id: r.id,
                type: 'REPORT',
                title: r.title,
                description: r.description,
                date: r.createdAt,
                location: 'São Paulo', // Placeholder
                status: r.status,
                user: r.author.name,
                icon: 'Camera'
            })),
            ...propVotes.map(v => ({
                id: v.id,
                type: 'PROP_VOTE',
                title: `Voto em Proposta #${v.propositionId}`,
                description: `Votou ${v.voteType === 'APPROVE' ? 'A favor' : 'Contra'}`,
                date: v.createdAt,
                location: 'Câmara Municipal',
                status: 'COMPUTADO',
                user: v.user.name,
                icon: 'Vote'
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});



app.post('/api/dou/summarize', async (req, res) => {
    const { text, url } = req.body;

    try {
        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        let contentToSummarize = text;

        if (url) {
            const axios = require('axios');
            const cheerio = require('cheerio');
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            // Try to extract main content
            contentToSummarize = $('.journal-content-article').text().trim() || $('body').text().trim();
            // Truncate to avoid token limits
            contentToSummarize = contentToSummarize.substring(0, 5000);
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Você é um assistente jurídico útil. Resuma a seguinte matéria do Diário Oficial da União em português claro e simples para um cidadão comum. Destaque o impacto prático."
                },
                {
                    role: "user",
                    content: contentToSummarize
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 500,
        });

        res.json({ summary: chatCompletion.choices[0]?.message?.content || "Não foi possível gerar o resumo." });
    } catch (error) {
        console.error('Error summarizing:', error);
        res.status(500).json({ error: 'Failed to summarize' });
    }
});

app.post('/api/propositions/summarize', async (req, res) => {
    const { text, type, number, year, author } = req.body;

    try {
        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Você é um consultor legislativo experiente. Analise a seguinte proposição legislativa e crie um resumo estruturado para um cidadão comum.\n\nUse formatação Markdown:\n- **O que é**: Uma explicação simples.\n- **Autor**: Mencione o autor e partido (se fornecido).\n- **Mudanças principais**: O que muda na lei atual.\n- **Prós e Contras**: Pontos positivos e negativos.\n- **🇧🇷 Como isso afeta a vida do brasileiro**: Seção obrigatória explicando o impacto prático no dia a dia.\n\nSeja imparcial e claro."
                },
                {
                    role: "user",
                    content: `Proposição: ${type} ${number}/${year}\nAutor: ${author || 'Não informado'}\n\nTexto/Ementa: ${text}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 800,
        });

        res.json({ summary: chatCompletion.choices[0]?.message?.content || "Não foi possível gerar o resumo." });
    } catch (error) {
        console.error('Error summarizing proposition:', error);
        res.status(500).json({ error: 'Failed to summarize' });
    }
});

// --- Start Server ---

// Start server if not running in Vercel
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

module.exports = app;
