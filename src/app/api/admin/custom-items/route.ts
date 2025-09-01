import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// GET - Fetch all custom items
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        const isAdmin = session?.user?.email === 'edersonleonardo@nexorrecords.com.br';
        console.log('Session in custom-items API:', {
            user: session?.user,
            isAdmin: isAdmin,
            email: session?.user?.email
        });

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const customItems = await prisma.customItem.findMany({
            orderBy: { order: 'asc' }
        });

        return NextResponse.json({ customItems });
    } catch (error) {
        console.error('Error fetching custom items:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new custom item
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        const isAdmin = session?.user?.email === 'edersonleonardo@nexorrecords.com.br';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, type, icon, color, order } = body;

        if (!name || !type) {
            return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
        }

        const customItem = await prisma.customItem.create({
            data: {
                name,
                description,
                type,
                icon,
                color,
                order: order || 0,
                createdBy: session.user.id
            }
        });

        return NextResponse.json({ customItem }, { status: 201 });
    } catch (error) {
        console.error('Error creating custom item:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update custom item
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        const isAdmin = session?.user?.email === 'edersonleonardo@nexorrecords.com.br';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, description, type, icon, color, order, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }

        const customItem = await prisma.customItem.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                type,
                icon,
                color,
                order,
                isActive
            }
        });

        return NextResponse.json({ customItem });
    } catch (error) {
        console.error('Error updating custom item:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete custom item
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        const isAdmin = session?.user?.email === 'edersonleonardo@nexorrecords.com.br';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }

        await prisma.customItem.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Custom item deleted successfully' });
    } catch (error) {
        console.error('Error deleting custom item:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 