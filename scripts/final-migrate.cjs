const { PrismaClient } = require('@prisma/client')

// Prisma do Neon (origem)
const sourcePrisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_vJKkzL4w0jcg@ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
        }
    }
})

// Prisma do Supabase (destino) - Agora configurado via .env
const targetPrisma = new PrismaClient()

async function migrateAllData() {
    try {
        console.log('🚀 Iniciando migração FINAL Neon → Supabase...')
        console.log('⏰ Início:', new Date().toLocaleString())

        // 1. Migrar usuários
        console.log('\n📦 Migrando usuários...')
        const users = await sourcePrisma.user.findMany()
        console.log(`   Encontrados: ${users.length} usuários`)

        for (let i = 0; i < users.length; i++) {
            const user = users[i]
            await targetPrisma.user.upsert({
                where: { id: user.id },
                update: user,
                create: user
            })
            if ((i + 1) % 10 === 0) {
                console.log(`   Progresso: ${i + 1}/${users.length} usuários`)
            }
        }
        console.log(`✅ ${users.length} usuários migrados com sucesso`)

        // 2. Migrar tracks
        console.log('\n🎵 Migrando tracks...')
        const tracks = await sourcePrisma.track.findMany()
        console.log(`   Encontrados: ${tracks.length} tracks`)

        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i]
            await targetPrisma.track.upsert({
                where: { id: track.id },
                update: track,
                create: track
            })
            if ((i + 1) % 50 === 0) {
                console.log(`   Progresso: ${i + 1}/${tracks.length} tracks`)
            }
        }
        console.log(`✅ ${tracks.length} tracks migrados com sucesso`)

        // 3. Migrar outras tabelas relacionais
        console.log('\n🔍 Migrando tabelas relacionais...')

        // Migrar Likes
        console.log('\n❤️  Migrando likes...')
        const likes = await sourcePrisma.like.findMany()
        console.log(`   Encontrados: ${likes.length} likes`)

        for (let i = 0; i < likes.length; i++) {
            const like = likes[i]
            await targetPrisma.like.upsert({
                where: { id: like.id },
                update: like,
                create: like
            })
            if ((i + 1) % 100 === 0) {
                console.log(`   Progresso: ${i + 1}/${likes.length} likes`)
            }
        }
        console.log(`✅ ${likes.length} likes migrados com sucesso`)

        // Migrar Downloads
        console.log('\n⬇️  Migrando downloads...')
        const downloads = await sourcePrisma.download.findMany()
        console.log(`   Encontrados: ${downloads.length} downloads`)

        for (let i = 0; i < downloads.length; i++) {
            const download = downloads[i]
            await targetPrisma.download.upsert({
                where: { id: download.id },
                update: download,
                create: download
            })
            if ((i + 1) % 100 === 0) {
                console.log(`   Progresso: ${i + 1}/${downloads.length} downloads`)
            }
        }
        console.log(`✅ ${downloads.length} downloads migrados com sucesso`)

        // Migrar Plays
        console.log('\n▶️  Migrando plays...')
        const plays = await sourcePrisma.play.findMany()
        console.log(`   Encontrados: ${plays.length} plays`)

        for (let i = 0; i < plays.length; i++) {
            const play = plays[i]
            await targetPrisma.play.upsert({
                where: { id: play.id },
                update: play,
                create: play
            })
            if ((i + 1) % 100 === 0) {
                console.log(`   Progresso: ${i + 1}/${plays.length} plays`)
            }
        }
        console.log(`✅ ${plays.length} plays migrados com sucesso`)

        // Migrar AdminMessages
        console.log('\n💬 Migrando mensagens admin...')
        const adminMessages = await sourcePrisma.adminMessage.findMany()
        console.log(`   Encontrados: ${adminMessages.length} mensagens`)

        for (let i = 0; i < adminMessages.length; i++) {
            const message = adminMessages[i]
            await targetPrisma.adminMessage.upsert({
                where: { id: message.id },
                update: message,
                create: message
            })
            if ((i + 1) % 50 === 0) {
                console.log(`   Progresso: ${i + 1}/${adminMessages.length} mensagens`)
            }
        }
        console.log(`✅ ${adminMessages.length} mensagens admin migradas com sucesso`)

        // Migrar CustomItems
        console.log('\n🎁 Migrando itens customizados...')
        const customItems = await sourcePrisma.customItem.findMany()
        console.log(`   Encontrados: ${customItems.length} itens`)

        for (let i = 0; i < customItems.length; i++) {
            const item = customItems[i]
            await targetPrisma.customItem.upsert({
                where: { id: item.id },
                update: item,
                create: item
            })
            if ((i + 1) % 50 === 0) {
                console.log(`   Progresso: ${i + 1}/${customItems.length} itens`)
            }
        }
        console.log(`✅ ${customItems.length} itens customizados migrados com sucesso`)

        console.log('\n🎉 MIGRAÇÃO COMPLETA COM SUCESSO!')
        console.log('📊 Resumo:')
        console.log(`   - Usuários: ${users.length}`)
        console.log(`   - Tracks: ${tracks.length}`)
        console.log(`   - Likes: ${likes.length}`)
        console.log(`   - Downloads: ${downloads.length}`)
        console.log(`   - Plays: ${plays.length}`)
        console.log(`   - Mensagens Admin: ${adminMessages.length}`)
        console.log(`   - Itens Customizados: ${customItems.length}`)
        console.log('⏰ Fim:', new Date().toLocaleString())

    } catch (error) {
        console.error('❌ Erro na migração:', error)
        throw error
    } finally {
        await sourcePrisma.$disconnect()
        await targetPrisma.$disconnect()
    }
}

// Executar migração
migrateAllData()
    .then(() => {
        console.log('✅ Script de migração final executado com sucesso!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Erro na execução:', error)
        process.exit(1)
    })
