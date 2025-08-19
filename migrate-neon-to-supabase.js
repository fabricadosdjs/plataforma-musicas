import { PrismaClient } from '@prisma/client';

async function migrateNeonToSupabase() {
    try {
        console.log('🔄 MIGRANDO DADOS DO NEON PARA O SUPABASE...');

        // Cliente Neon (origem)
        const neonPrisma = new PrismaClient({
            datasources: {
                db: {
                    url: 'postgresql://neondb_owner:npg_vJKkzL4w0jcg@ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
                }
            }
        });

        // Cliente Supabase (destino)
        const supabasePrisma = new PrismaClient();

        try {
            // Conectar aos dois bancos
            await neonPrisma.$connect();
            await supabasePrisma.$connect();

            console.log('✅ Conectado ao Neon e Supabase!');

            // 1. MIGRAR USUÁRIOS
            console.log('\n👥 MIGRANDO USUÁRIOS...');

            const neonUsers = await neonPrisma.$queryRawUnsafe(`SELECT * FROM "User"`);
            console.log(`📊 ${neonUsers.length} usuários encontrados no Neon`);

            for (const neonUser of neonUsers) {
                try {
                    // Verificar se usuário já existe no Supabase
                    const existingUser = await supabasePrisma.user.findUnique({
                        where: { email: neonUser.email }
                    });

                    if (!existingUser) {
                        // Criar usuário no Supabase
                        const newUser = await supabasePrisma.user.create({
                            data: {
                                id: neonUser.id,
                                email: neonUser.email,
                                name: neonUser.name,
                                dailyDownloadCount: neonUser.dailyDownloadCount || 0,
                                lastDownloadReset: neonUser.lastDownloadReset,
                                createdAt: neonUser.createdAt,
                                updatedAt: neonUser.updatedAt,
                                is_vip: neonUser.is_vip || false,
                                status: neonUser.status || 'ativo',
                                valor: neonUser.valor,
                                vencimento: neonUser.vencimento,
                                customBenefits: neonUser.customBenefits,
                                dataPagamento: neonUser.dataPagamento,
                                lastWeekReset: neonUser.lastWeekReset,
                                weeklyPackRequests: neonUser.weeklyPackRequests || 0,
                                weeklyPlaylistDownloads: neonUser.weeklyPlaylistDownloads || 0,
                                weeklyPackRequestsUsed: neonUser.weeklyPackRequestsUsed || 0,
                                weeklyPlaylistDownloadsUsed: neonUser.weeklyPlaylistDownloadsUsed || 0,
                                whatsapp: neonUser.whatsapp,
                                deemix: neonUser.deemix || false,
                                deezerPremium: neonUser.deezerPremium || false,
                                deezerEmail: neonUser.deezerEmail,
                                deezerPassword: neonUser.deezerPassword,
                                isPro: neonUser.isPro || false,
                                isAdmin: neonUser.isAdmin || false,
                                password: neonUser.password,
                                isUploader: neonUser.isUploader || false,
                                dataPrimeiroPagamento: neonUser.dataPrimeiroPagamento,
                                planName: neonUser.planName
                            }
                        });
                        console.log(`✅ Usuário criado: ${neonUser.name} (${neonUser.email})`);
                    } else {
                        console.log(`ℹ️ Usuário já existe: ${neonUser.name}`);
                    }
                } catch (error) {
                    console.log(`❌ Erro ao migrar usuário ${neonUser.email}:`, error.message);
                }
            }

            // 2. MIGRAR MÚSICAS
            console.log('\n🎵 MIGRANDO MÚSICAS...');

            const neonTracks = await neonPrisma.$queryRawUnsafe(`SELECT * FROM "Track"`);
            console.log(`📊 ${neonTracks.length} músicas encontradas no Neon`);

            let tracksMigrated = 0;
            for (const neonTrack of neonTracks) {
                try {
                    // Verificar se música já existe no Supabase
                    const existingTrack = await supabasePrisma.track.findFirst({
                        where: {
                            songName: neonTrack.songName,
                            artist: neonTrack.artist,
                            version: neonTrack.version
                        }
                    });

                    if (!existingTrack) {
                        // Criar música no Supabase
                        const newTrack = await supabasePrisma.track.create({
                            data: {
                                id: neonTrack.id,
                                songName: neonTrack.songName,
                                artist: neonTrack.artist,
                                style: neonTrack.style,
                                version: neonTrack.version,
                                pool: neonTrack.pool,
                                imageUrl: neonTrack.imageUrl,
                                previewUrl: neonTrack.previewUrl,
                                downloadUrl: neonTrack.downloadUrl,
                                releaseDate: neonTrack.releaseDate,
                                createdAt: neonTrack.createdAt,
                                updatedAt: neonTrack.updatedAt,
                                isCommunity: neonTrack.isCommunity || false,
                                uploadedBy: neonTrack.uploadedBy,
                                aiMeta: neonTrack.aiMeta,
                                bitrate: neonTrack.bitrate || 320
                            }
                        });
                        tracksMigrated++;
                        if (tracksMigrated % 100 === 0) {
                            console.log(`  📈 ${tracksMigrated} músicas migradas...`);
                        }
                    }
                } catch (error) {
                    console.log(`❌ Erro ao migrar música ${neonTrack.songName}:`, error.message);
                }
            }

            console.log(`✅ ${tracksMigrated} músicas migradas com sucesso!`);

            // 3. MIGRAR DOWNLOADS
            console.log('\n⬇️ MIGRANDO DOWNLOADS...');

            const neonDownloads = await neonPrisma.$queryRawUnsafe(`SELECT * FROM "Download"`);
            console.log(`📊 ${neonDownloads.length} downloads encontrados no Neon`);

            let downloadsMigrated = 0;
            for (const neonDownload of neonDownloads) {
                try {
                    const existingDownload = await supabasePrisma.download.findFirst({
                        where: {
                            trackId: neonDownload.trackId,
                            userId: neonDownload.userId,
                            downloadedAt: neonDownload.downloadedAt
                        }
                    });

                    if (!existingDownload) {
                        await supabasePrisma.download.create({
                            data: {
                                id: neonDownload.id,
                                trackId: neonDownload.trackId,
                                userId: neonDownload.userId,
                                downloadedAt: neonDownload.downloadedAt,
                                createdAt: neonDownload.createdAt,
                                nextAllowedDownload: neonDownload.nextAllowedDownload
                            }
                        });
                        downloadsMigrated++;
                    }
                } catch (error) {
                    console.log(`❌ Erro ao migrar download ${neonDownload.id}:`, error.message);
                }
            }

            console.log(`✅ ${downloadsMigrated} downloads migrados com sucesso!`);

            // 4. MIGRAR LIKES
            console.log('\n❤️ MIGRANDO LIKES...');

            const neonLikes = await neonPrisma.$queryRawUnsafe(`SELECT * FROM "Like"`);
            console.log(`📊 ${neonLikes.length} likes encontrados no Neon`);

            let likesMigrated = 0;
            for (const neonLike of neonLikes) {
                try {
                    const existingLike = await supabasePrisma.like.findFirst({
                        where: {
                            trackId: neonLike.trackId,
                            userId: neonLike.userId
                        }
                    });

                    if (!existingLike) {
                        await supabasePrisma.like.create({
                            data: {
                                id: neonLike.id,
                                trackId: neonLike.trackId,
                                userId: neonLike.userId,
                                createdAt: neonLike.createdAt
                            }
                        });
                        likesMigrated++;
                    }
                } catch (error) {
                    console.log(`❌ Erro ao migrar like ${neonLike.id}:`, error.message);
                }
            }

            console.log(`✅ ${likesMigrated} likes migrados com sucesso!`);

            // 5. VERIFICAR RESULTADO
            console.log('\n📊 VERIFICANDO RESULTADO DA MIGRAÇÃO...');

            const supabaseUsers = await supabasePrisma.user.count();
            const supabaseTracks = await supabasePrisma.track.count();
            const supabaseDownloads = await supabasePrisma.download.count();
            const supabaseLikes = await supabasePrisma.like.count();

            console.log(`👥 Usuários no Supabase: ${supabaseUsers}`);
            console.log(`🎵 Músicas no Supabase: ${supabaseTracks}`);
            console.log(`⬇️ Downloads no Supabase: ${supabaseDownloads}`);
            console.log(`❤️ Likes no Supabase: ${supabaseLikes}`);

            console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
            console.log('💡 Seus dados foram migrados do Neon para o Supabase!');

        } catch (error) {
            console.log('❌ Erro durante a migração:', error.message);
        } finally {
            await neonPrisma.$disconnect();
            await supabasePrisma.$disconnect();
        }

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

migrateNeonToSupabase();

