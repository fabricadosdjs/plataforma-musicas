const { PrismaClient } = require('@prisma/client')

async function testSupabase() {
    console.log('🔍 Testando conectividade com Supabase...')

    // Testar diferentes formatos de URL
    const urls = [
        "postgresql://postgres:Hu3AhxdGya01q8dX@db.viffcgeoqtkovryrbalu.supabase.co:5432/postgres",
        "postgresql://postgres:Hu3AhxdGya01q8dX@db.viffcgeoqtkovryrbalu.supabase.co:6543/postgres",
        "postgresql://postgres:Hu3AhxdGya01q8dX@db.viffcgeoqtkovryrbalu.supabase.co/postgres"
    ]

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        console.log(`\n📡 Testando URL ${i + 1}: ${url}`)

        try {
            const prisma = new PrismaClient({
                datasources: { db: { url } }
            })

            // Tentar conectar
            await prisma.$connect()
            console.log(`✅ Conexão bem-sucedida com: ${url}`)

            // Testar query simples
            const result = await prisma.$queryRaw`SELECT 1 as test`
            console.log(`✅ Query de teste executada:`, result)

            await prisma.$disconnect()
            return url // Retornar URL que funcionou

        } catch (error) {
            console.log(`❌ Falha na conexão:`, error.message)
        }
    }

    console.log('\n🚨 Nenhuma URL funcionou!')
    console.log('📝 Verifique:')
    console.log('   1. Credenciais do Supabase')
    console.log('   2. Status do projeto')
    console.log('   3. Configurações de rede')

    return null
}

// Executar teste
testSupabase()
    .then((workingUrl) => {
        if (workingUrl) {
            console.log(`\n🎉 URL funcional encontrada: ${workingUrl}`)
        }
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Erro no teste:', error)
        process.exit(1)
    })
