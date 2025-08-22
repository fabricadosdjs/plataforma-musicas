const { Client } = require('pg');

async function setupDatabaseWithSQL() {
    let client;

    try {
        console.log('🚀 Iniciando configuração do banco com SQL direto...');

        // Conectar ao banco usando as variáveis de ambiente
        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        await client.connect();
        console.log('✅ Conexão com banco estabelecida');

        // 1. Verificar se a tabela Release existe
        const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Release'
      );
    `);

        if (!tableExists.rows[0].exists) {
            console.log('📝 Criando tabela Release...');

            await client.query(`
        CREATE TABLE "Release" (
          "id" SERIAL PRIMARY KEY,
          "title" VARCHAR(255) NOT NULL,
          "artist" VARCHAR(255) NOT NULL,
          "albumArt" TEXT NOT NULL,
          "description" TEXT,
          "genre" VARCHAR(100) NOT NULL,
          "releaseDate" TIMESTAMP NOT NULL,
          "trackCount" INTEGER DEFAULT 0,
          "duration" VARCHAR(50),
          "label" VARCHAR(255),
          "producer" VARCHAR(255),
          "featured" BOOLEAN DEFAULT false,
          "exclusive" BOOLEAN DEFAULT false,
          "streaming" JSONB,
          "social" JSONB,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            console.log('✅ Tabela Release criada');
        } else {
            console.log('⚠️ Tabela Release já existe');
        }

        // 2. Verificar se a coluna releaseId existe na tabela Track
        const columnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'Track' 
        AND column_name = 'releaseId'
      );
    `);

        if (!columnExists.rows[0].exists) {
            console.log('🔗 Adicionando coluna releaseId na tabela Track...');

            await client.query(`
        ALTER TABLE "Track" ADD COLUMN "releaseId" INTEGER;
      `);

            console.log('✅ Coluna releaseId adicionada');
        } else {
            console.log('⚠️ Coluna releaseId já existe');
        }

        // 3. Criar índices para melhorar performance
        console.log('📊 Criando índices...');

        try {
            await client.query(`
        CREATE INDEX IF NOT EXISTS "idx_release_artist" ON "Release"("artist");
      `);

            await client.query(`
        CREATE INDEX IF NOT EXISTS "idx_release_genre" ON "Release"("genre");
      `);

            await client.query(`
        CREATE INDEX IF NOT EXISTS "idx_release_date" ON "Release"("releaseDate");
      `);

            await client.query(`
        CREATE INDEX IF NOT EXISTS "idx_track_release" ON "Track"("releaseId");
      `);

            console.log('✅ Índices criados');
        } catch (error) {
            console.log('⚠️ Erro ao criar índices:', error.message);
        }

        // 4. Inserir dados de exemplo (apenas se não existirem)
        console.log('📝 Inserindo releases de exemplo...');

        const releases = [
            {
                title: 'Summer Vibes 2024',
                artist: 'DJ Jéssika Luana',
                albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
                description: 'Coletânea de músicas eletrônicas para o verão, com batidas contagiantes e melodias energéticas.',
                genre: 'Electronic',
                releaseDate: '2024-01-15',
                trackCount: 12,
                duration: '1:15:30',
                label: 'Plataforma Músicas',
                producer: 'DJ Jéssika Luana',
                featured: true,
                exclusive: false,
                streaming: JSON.stringify({
                    spotify: 'https://open.spotify.com/album/example',
                    deezer: 'https://deezer.com/album/example'
                }),
                social: JSON.stringify({
                    instagram: '@djessikaluana',
                    facebook: 'DJ Jéssika Luana'
                })
            },
            {
                title: 'Deep House Collection',
                artist: 'Various Artists',
                albumArt: 'https://images.unsplash.com/photo-1511379938545-c1e474798dcd?w=400&h=400&fit=crop',
                description: 'Seleção das melhores músicas deep house da plataforma, perfeita para momentos de relaxamento.',
                genre: 'Deep House',
                releaseDate: '2024-01-10',
                trackCount: 8,
                duration: '58:45',
                label: 'Plataforma Músicas',
                producer: 'Various',
                featured: false,
                exclusive: true,
                streaming: JSON.stringify({
                    spotify: 'https://open.spotify.com/album/example2',
                    apple: 'https://music.apple.com/album/example2'
                }),
                social: JSON.stringify({
                    website: 'https://plataforma-musicas.com'
                })
            },
            {
                title: 'Progressive House Hits',
                artist: 'DJ Carlos Silva',
                albumArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
                description: 'Os maiores sucessos de progressive house, com batidas progressivas e melodias cativantes.',
                genre: 'Progressive House',
                releaseDate: '2024-01-05',
                trackCount: 15,
                duration: '1:45:20',
                label: 'Plataforma Músicas',
                producer: 'DJ Carlos Silva',
                featured: true,
                exclusive: false,
                streaming: JSON.stringify({
                    spotify: 'https://open.spotify.com/album/example3',
                    deezer: 'https://deezer.com/album/example3'
                }),
                social: JSON.stringify({
                    instagram: '@djcarlossilva',
                    youtube: 'DJ Carlos Silva'
                })
            },
            {
                title: 'Techno Underground',
                artist: 'Various Artists',
                albumArt: 'https://images.unsplash.com/photo-1511379938545-c1e474798dcd?w=400&h=400&fit=crop',
                description: 'Coletânea underground de techno, com artistas emergentes e sons experimentais.',
                genre: 'Techno',
                releaseDate: '2024-01-01',
                trackCount: 10,
                duration: '1:20:15',
                label: 'Plataforma Músicas',
                producer: 'Various',
                featured: false,
                exclusive: false,
                streaming: JSON.stringify({
                    spotify: 'https://open.spotify.com/album/example4'
                }),
                social: JSON.stringify({
                    discord: 'https://discord.gg/techno'
                })
            },
            {
                title: 'Trance Classics',
                artist: 'DJ Maria Santos',
                albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
                description: 'Clássicos do trance que marcaram época, com melodias épicas e batidas energéticas.',
                genre: 'Trance',
                releaseDate: '2023-12-20',
                trackCount: 20,
                duration: '2:15:45',
                label: 'Plataforma Músicas',
                producer: 'DJ Maria Santos',
                featured: true,
                exclusive: true,
                streaming: JSON.stringify({
                    spotify: 'https://open.spotify.com/album/example5',
                    deezer: 'https://deezer.com/album/example5',
                    apple: 'https://music.apple.com/album/example5'
                }),
                social: JSON.stringify({
                    instagram: '@djmaria',
                    facebook: 'DJ Maria Santos',
                    youtube: 'DJ Maria Santos'
                })
            }
        ];

        for (const release of releases) {
            try {
                // Verificar se já existe
                const existing = await client.query(`
          SELECT id FROM "Release" WHERE title = $1 AND artist = $2
        `, [release.title, release.artist]);

                if (existing.rows.length === 0) {
                    await client.query(`
            INSERT INTO "Release" (
              title, artist, "albumArt", description, genre, "releaseDate", 
              "trackCount", duration, label, producer, featured, exclusive, 
              streaming, social
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          `, [
                        release.title, release.artist, release.albumArt, release.description,
                        release.genre, release.releaseDate, release.trackCount, release.duration,
                        release.label, release.producer, release.featured, release.exclusive,
                        release.streaming, release.social
                    ]);

                    console.log(`✅ Release criado: ${release.title}`);
                } else {
                    console.log(`⚠️ Release já existe: ${release.title}`);
                }
            } catch (error) {
                console.error(`❌ Erro ao criar release ${release.title}:`, error.message);
            }
        }

        // 5. Conectar algumas músicas existentes aos releases
        console.log('🔗 Conectando músicas aos releases...');

        try {
            // Buscar releases criados
            const createdReleases = await client.query(`
        SELECT id, title FROM "Release" ORDER BY id
      `);

            if (createdReleases.rows.length > 0) {
                // Atualizar músicas de DJ Jéssika
                const jessikaResult = await client.query(`
          UPDATE "Track" 
          SET "releaseId" = $1 
          WHERE (artist ILIKE '%Jéssika%' OR artist ILIKE '%Jessika%')
          AND "releaseId" IS NULL
          LIMIT 5
          RETURNING id
        `, [createdReleases.rows[0].id]);

                if (jessikaResult.rows.length > 0) {
                    console.log(`✅ ${jessikaResult.rows.length} músicas conectadas ao release "${createdReleases.rows[0].title}"`);
                }

                // Atualizar músicas Deep House
                const deepHouseResult = await client.query(`
          UPDATE "Track" 
          SET "releaseId" = $1 
          WHERE (style ILIKE '%Deep House%' OR style ILIKE '%deep house%')
          AND "releaseId" IS NULL
          LIMIT 3
          RETURNING id
        `, [createdReleases.rows[1].id]);

                if (deepHouseResult.rows.length > 0) {
                    console.log(`✅ ${deepHouseResult.rows.length} músicas conectadas ao release "${createdReleases.rows[1].title}"`);
                }

                // Atualizar músicas Progressive House
                const progressiveResult = await client.query(`
          UPDATE "Track" 
          SET "releaseId" = $1 
          WHERE (style ILIKE '%Progressive%' OR style ILIKE '%progressive%')
          AND "releaseId" IS NULL
          LIMIT 4
          RETURNING id
        `, [createdReleases.rows[2].id]);

                if (progressiveResult.rows.length > 0) {
                    console.log(`✅ ${progressiveResult.rows.length} músicas conectadas ao release "${createdReleases.rows[2].title}"`);
                }
            }
        } catch (error) {
            console.log('⚠️ Não foi possível conectar músicas aos releases:', error.message);
        }

        // 6. Atualizar contadores de tracks
        console.log('📊 Atualizando contadores de tracks...');

        try {
            await client.query(`
        UPDATE "Release" 
        SET "trackCount" = (
          SELECT COUNT(*) 
          FROM "Track" 
          WHERE "Track"."releaseId" = "Release"."id"
        )
      `);

            console.log('✅ Contadores de tracks atualizados');
        } catch (error) {
            console.log('⚠️ Não foi possível atualizar contadores:', error.message);
        }

        // 7. Verificar resultado final
        console.log('\n📋 Resumo da configuração:');

        const totalReleases = await client.query(`
      SELECT COUNT(*) as total FROM "Release"
    `);

        const totalTracksWithRelease = await client.query(`
      SELECT COUNT(*) as total FROM "Track" WHERE "releaseId" IS NOT NULL
    `);

        console.log(`🎵 Total de releases: ${totalReleases.rows[0].total}`);
        console.log(`🔗 Tracks conectadas a releases: ${totalTracksWithRelease.rows[0].total}`);

        console.log('\n🎉 Configuração do banco concluída com sucesso!');
        console.log('💡 Agora você pode usar a API de releases com dados reais do banco.');

    } catch (error) {
        console.error('❌ Erro durante a configuração:', error);

        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Dica: Verifique se o banco está rodando e acessível');
        } else if (error.code === '28P01') {
            console.log('💡 Dica: Verifique as credenciais do banco no arquivo .env');
        } else if (error.code === '42P07') {
            console.log('💡 Dica: Alguns objetos já existem no banco');
        }
    } finally {
        if (client) {
            await client.end();
            console.log('🔌 Conexão com banco fechada');
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    setupDatabaseWithSQL();
}

module.exports = { setupDatabaseWithSQL };
