require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL);

        await prisma.$connect();
        console.log('✅ Successfully connected to Supabase!');

        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error(error.message);
        process.exit(1);
    }
}

testConnection();
