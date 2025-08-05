import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch active custom items for public display
export async function GET() {
    try {
        const customItems = await prisma.customItem.findMany({
            where: {
                isActive: true
            },
            orderBy: { order: 'asc' },
            select: {
                id: true,
                name: true,
                description: true,
                type: true,
                icon: true,
                color: true,
                order: true
            }
        });

        return NextResponse.json({ customItems });
    } catch (error) {
        console.error('Error fetching custom items:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 