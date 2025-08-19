const { PrismaClient } = require('@prisma/client')

async function testSupabase() {
    console.log('🔍 Testando conectividade com Supabase (NOVA URL)...')
    
    const url = "postgresql://postgres.viffcgeoqtkovryrbalu:Hu3AhxdGya01q8dX@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
    console.log(`📡 Testando URL: ${url}`)
    
    try {
        const prisma = new PrismaClient({
            datasources: { db: { url } }
        })
        
        // Tentar conectar
        console.log('🔌 Conectando...')
        await prisma.$connect()
        console.log(`✅ Conexão bem-sucedida!`)
        
        // Testar query simples
        console.log('🧪 Executando query de teste...')
        const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`
        console.log(`✅ Query de teste executada:`, result)
        
        await prisma.$disconnect()
        console.log('🔌 Conexão fechada')
        
        return url
        
    } catch (error) {
        console.log(`❌ Falha na conexão:`, error.message)
        return null
    }
}

// Executar teste
testSupabase()
    .then((workingUrl) => {
        if (workingUrl) {
            console.log(`\n🎉 Supabase conectado com sucesso!`)
            console.log(`📝 URL funcional: ${workingUrl}`)
            console.log(`\n🚀 Agora podemos executar a migração!`)
        } else {
            console.log(`\n🚨 Supabase ainda não está acessível`)
        }
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Erro no teste:', error)
        process.exit(1)
    })
