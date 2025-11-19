import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma-client'
import { z } from 'zod'
import { requireAuth } from '@/lib/api-auth'

const categoriaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const [categorias, total] = await Promise.all([
      prisma.categorias.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      prisma.categorias.count()
    ]);

    return NextResponse.json({
      categorias,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const result = categoriaSchema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        field: issue.path[0],
        message: issue.message
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Verificar se categoria já existe
    const existe = await prisma.categorias.findFirst({
      where: { nome: result.data.nome }
    });

    if (existe) {
      return NextResponse.json(
        { error: 'Categoria já existe' }, 
        { status: 409 }
      );
    }

    const novaCategoria = await prisma.categorias.create({
      data: result.data,
    });

    return NextResponse.json(novaCategoria, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao criar categoria' }, 
      { status: 500 }
    );
  }
}

// Para categorias e produtos, adicione:

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  // Implementar delete
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  // Implementar update
}