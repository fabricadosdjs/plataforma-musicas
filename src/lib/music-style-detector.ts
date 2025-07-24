// Sistema inteligente de detecção de estilos musicais
export interface StyleDetectionResult {
    style: string;
    confidence: number;
    subgenre?: string;
    bpm?: number;
    key?: string;
    mood?: string;
}

export class MusicStyleDetector {
    private static readonly stylePatterns: Record<string, {
        keywords: string[];
        artists: string[];
        bpmRange: [number, number];
        patterns: RegExp;
    }> = {
            // Big Room House e Festival
            'Big Room': {
                keywords: ['big room', 'festival', 'mainstage', 'drop', 'anthem', 'massive', 'stadium'],
                artists: ['martin garrix', 'hardwell', 'dimitri vegas', 'like mike', 'w&w', 'blasterjaxx', 'mattn', 'martin solveig'],
                bpmRange: [128, 132],
                patterns: /\b(big.?room|festival|mainstage|anthem|massive|stadium)\b/i
            },
            'Future': {
                keywords: ['future house', 'future', 'groove', 'funky', 'deep', 'underground'],
                artists: ['tchami', 'oliver heldens', 'don diablo', 'noel holler', 'brooks', 'curbi', 'marten hørger'],
                bpmRange: [124, 128],
                patterns: /\b(future.?house|future|groove|funky)\b/i
            },
            'Progressive': {
                keywords: ['progressive', 'melodic', 'epic', 'uplifting', 'emotional', 'cinematic'],
                artists: ['deadmau5', 'eric prydz', 'above beyond', 'armin', 'lane 8', 'yotto', 'marnage', 'rahul'],
                bpmRange: [128, 132],
                patterns: /\b(progressive|melodic|epic|uplifting|cinematic)\b/i
            },
            'Tech House': {
                keywords: ['tech house', 'tech', 'minimal', 'groove', 'underground', 'club'],
                artists: ['carl cox', 'jamie jones', 'hot since 82', 'fisher', 'patrick topping', 'mau p'],
                bpmRange: [125, 130],
                patterns: /\b(tech.?house|tech|minimal|groove|underground)\b/i
            },

            // House e subgêneros
            'Deep House': {
                keywords: ['deep', 'soulful', 'underground', 'jazzy', 'warm', 'smooth'],
                artists: ['kerri chandler', 'maya jane coles', 'disclosure', 'duke dumont', 'lane 8'],
                bpmRange: [120, 125],
                patterns: /\b(deep|soulful|underground|jazzy|smooth)\b/i
            },
            'Electro': {
                keywords: ['electro', 'dirty', 'aggressive', 'energy', 'club', 'banger'],
                artists: ['david guetta', 'tiesto', 'afrojack', 'steve aoki', 'diplo'],
                bpmRange: [128, 132],
                patterns: /\b(electro|dirty|aggressive|banger)\b/i
            },
            'Bass House': {
                keywords: ['bass house', 'bass', 'wobbly', 'heavy', 'underground', 'dirty'],
                artists: ['ac slater', 'jauz', 'ephwurd', 'malaa', 'confession'],
                bpmRange: [125, 130],
                patterns: /\b(bass.?house|wobbly|heavy.?bass)\b/i
            },

            // R&B/Hip-Hop Influenced Electronic
            'R&B': {
                keywords: ['rnb', 'r&b', 'soul', 'smooth', 'vocal', 'urban', 'neo soul'],
                artists: ['masego', 'mary j blige', 'mary j.', 'émilie rachel', 'martina budde'],
                bpmRange: [90, 110],
                patterns: /\b(rnb|r.?b|soul|smooth|urban|neo.?soul)\b/i
            },
            'Hip Hop': {
                keywords: ['hip hop', 'rap', 'urban', 'trap', 'street', 'work that', 'club'],
                artists: ['mary j blige', 'mavado', 'mary j.'],
                bpmRange: [70, 90],
                patterns: /\b(hip.?hop|rap|urban|street|work.?that)\b/i
            },

            // Electronic Dance mais específicos
            'Dance': {
                keywords: ['dance', 'pop', 'radio', 'mainstream', 'vocal', 'commercial', 'hello', 'club'],
                artists: ['calvin harris', 'david guetta', 'the chainsmokers', 'martin solveig', 'zedd', 'marshmello'],
                bpmRange: [128, 132],
                patterns: /\b(dance|pop|radio|mainstream|commercial|hello)\b/i
            },
            'Club': {
                keywords: ['club', 'dance', 'floor', 'party', 'night', 'energy'],
                artists: ['matonik', 'mashbit', 'alto moon'],
                bpmRange: [125, 130],
                patterns: /\b(club|dance|floor|party|night)\b/i
            },

            // Tropical e Chill
            'Tropical': {
                keywords: ['tropical', 'summer', 'chill', 'relaxed', 'island', 'beach', 'felicidad'],
                artists: ['kygo', 'thomas jack', 'matoma', 'klingande', 'robin schulz', 'martina budde'],
                bpmRange: [120, 126],
                patterns: /\b(tropical|summer|chill|island|beach|felicidad)\b/i
            },

            // Techno e subgêneros
            'Techno': {
                keywords: ['techno', 'industrial', 'dark', 'driving', 'hypnotic', 'underground'],
                artists: ['carl cox', 'richie hawtin', 'adam beyer', 'charlotte de witte', 'amelie lens'],
                bpmRange: [130, 140],
                patterns: /\b(techno|industrial|driving|hypnotic)\b/i
            },
            'Minimal': {
                keywords: ['minimal', 'stripped', 'reduced', 'subtle', 'hypnotic', 'berlin'],
                artists: ['richie hawtin', 'max richter', 'nils frahm', 'marcel dettmann'],
                bpmRange: [125, 135],
                patterns: /\b(minimal|stripped|reduced|subtle)\b/i
            },

            // Trance e subgêneros
            'Trance': {
                keywords: ['trance', 'uplifting', 'euphoric', 'emotional', 'breakdown', 'anthem'],
                artists: ['armin van buuren', 'tiesto', 'above beyond', 'ferry corsten', 'aly fila', 'marlon hoffstadt', 'dj daddy trance'],
                bpmRange: [130, 138],
                patterns: /\b(trance|uplifting|euphoric|breakdown|anthem)\b/i
            },
            'Prog Trance': {
                keywords: ['progressive trance', 'progressive', 'melodic', 'emotional', 'journey'],
                artists: ['above beyond', 'cosmic gate', 'aly fila', 'john 00 fleming'],
                bpmRange: [132, 136],
                patterns: /\b(progressive.?trance|journey|emotional)\b/i
            },
            'Psytrance': {
                keywords: ['psy', 'psychedelic', 'goa', 'tribal', 'forest', 'full on'],
                artists: ['vini vici', 'infected mushroom', 'astrix', 'ace ventura'],
                bpmRange: [140, 150],
                patterns: /\b(psy|psychedelic|goa|tribal|forest)\b/i
            },

            // Drum & Bass e subgêneros
            'DnB': {
                keywords: ['drum', 'bass', 'dnb', 'jungle', 'breakbeat', 'liquid'],
                artists: ['pendulum', 'netsky', 'sub focus', 'chase status', 'wilkinson'],
                bpmRange: [170, 180],
                patterns: /\b(drum.?bass|dnb|jungle|breakbeat)\b/i
            },
            'Liquid': {
                keywords: ['liquid', 'smooth', 'jazzy', 'melodic', 'soulful', 'atmospheric'],
                artists: ['netsky', 'london elektricity', 'calibre', 'high contrast'],
                bpmRange: [170, 175],
                patterns: /\b(liquid|smooth|jazzy|atmospheric)\b/i
            },

            // Dubstep e Bass Music
            'Dubstep': {
                keywords: ['dubstep', 'wobble', 'drop', 'bass', 'heavy', 'filthy'],
                artists: ['skrillex', 'nero', 'flux pavilion', 'modestep', 'zomboy'],
                bpmRange: [140, 150],
                patterns: /\b(dubstep|wobble|heavy.?bass|filthy)\b/i
            },
            'Future Bass': {
                keywords: ['future bass', 'future', 'melodic', 'emotional', 'cinematic', 'ambient'],
                artists: ['flume', 'odesza', 'illenium', 'porter robinson', 'said the sky'],
                bpmRange: [140, 160],
                patterns: /\b(future.?bass|melodic|cinematic|emotional)\b/i
            },
            'Trap': {
                keywords: ['trap', 'hip hop', 'rap', 'urban', 'heavy', '808'],
                artists: ['rl grime', 'flosstradamus', 'diplo', 'yellow claw'],
                bpmRange: [140, 160],
                patterns: /\b(trap|hip.?hop|urban|808)\b/i
            },

            // Mashup e Bootleg
            'Mashup': {
                keywords: ['mashup', 'vs', 'bootleg', 'edit', 'remix', 'rework', 'blend'],
                artists: ['mark anthony', 'dj snake', 'yellow claw', 'dj bl3nd'],
                bpmRange: [125, 135],
                patterns: /\b(mashup|vs|bootleg|edit|blend|rework)\b/i
            },

            // Italo e Euro
            'Italo': {
                keywords: ['italo', 'disco', 'euro', 'classic', 'vintage', 'dolce', 'vita', 'amore', 'bambina', 'coeur', 'boom'],
                artists: ['giorgio moroder', 'kraftwerk', 'daft punk', 'pinocchio', 'karma', 'mastro', 'lia de bahia'],
                bpmRange: [120, 130],
                patterns: /\b(italo|disco|euro|classic|dolce|vita|amore|bambina|coeur|boom|pinocchio)\b/i
            },
            'Eurodance': {
                keywords: ['euro', 'dance', 'pop', 'commercial', 'vocal', 'party', 'night', 'dream', 'love'],
                artists: ['soundlovers', 'fourteen', 'supercar', 'dv', 'scooter', 'cascada'],
                bpmRange: [125, 135],
                patterns: /\b(euro|dance|pop|commercial|night|dream|love|soundlovers)\b/i
            },

            // Música Brasileira
            'Sertanejo': {
                keywords: ['sertanejo', 'country', 'caipira', 'rural', 'fazenda', 'natal', 'canção', 'estrela', 'feliz', 'sino', 'belém'],
                artists: ['chitãozinho', 'xororó', 'chitãozinho & xororó', 'zezé di camargo', 'luciano', 'leonardo', 'leandro', 'victor', 'leo', 'bruno', 'marrone', 'joão bosco', 'vinícius', 'gusttavo lima', 'michel teló'],
                bpmRange: [90, 120],
                patterns: /\b(sertanejo|country|caipira|rural|fazenda|natal|canção|estrela|feliz|sino|belém|chitão|xororó)\b/i
            },
            'MPB': {
                keywords: ['mpb', 'música popular brasileira', 'bossa nova', 'samba', 'brasileiro', 'brasil'],
                artists: ['caetano veloso', 'gilberto gil', 'chico buarque', 'maria bethânia', 'gal costa', 'djavan', 'ivan lins'],
                bpmRange: [80, 130],
                patterns: /\b(mpb|bossa.?nova|samba|brasileiro|brasil)\b/i
            },
            'Forró': {
                keywords: ['forró', 'xote', 'baião', 'nordeste', 'sanfona', 'zabumba', 'triângulo'],
                artists: ['luiz gonzaga', 'dominguinhos', 'falamansa', 'calcinha preta', 'aviões do forró'],
                bpmRange: [120, 140],
                patterns: /\b(forró|xote|baião|nordeste|sanfona|zabumba)\b/i
            },
            'Funk': {
                keywords: ['funk', 'baile', 'favela', 'rio', 'carioca', 'mc', 'tamborzão'],
                artists: ['mc kevinho', 'mc gui', 'mc joão', 'anitta', 'ludmilla'],
                bpmRange: [130, 150],
                patterns: /\b(funk|baile|favela|carioca|tamborzão)\b/i
            },
            'Pagode': {
                keywords: ['pagode', 'samba', 'roda', 'cavaquinho', 'pandeiro', 'tantã'],
                artists: ['grupo revelação', 'exaltasamba', 'só pra contrariar', 'raça negra', 'katinguelê'],
                bpmRange: [100, 130],
                patterns: /\b(pagode|roda|cavaquinho|pandeiro|tantã)\b/i
            },

            // Ambient e Chill
            'Ambient': {
                keywords: ['ambient', 'chill', 'atmospheric', 'downtempo', 'relaxed', 'meditative'],
                artists: ['brian eno', 'boards of canada', 'tycho', 'emancipator'],
                bpmRange: [80, 120],
                patterns: /\b(ambient|chill|atmospheric|downtempo|meditative)\b/i
            }
        };

    static detectStyle(artist: string, title: string, filename?: string): StyleDetectionResult {
        const searchText = `${artist} ${title} ${filename || ''}`.toLowerCase();
        let bestMatch: StyleDetectionResult = {
            style: 'Electronic',
            confidence: 0.3
        };

        // Verificar cada estilo
        for (const [styleName, config] of Object.entries(this.stylePatterns)) {
            let confidence = 0;

            // Verificar palavras-chave no título/artista
            config.keywords.forEach(keyword => {
                if (searchText.includes(keyword.toLowerCase())) {
                    confidence += 0.3;
                }
            });

            // Verificar padrões regex
            if (config.patterns.test(searchText)) {
                confidence += 0.4;
            }

            // Verificar artistas conhecidos
            config.artists.forEach(knownArtist => {
                if (searchText.includes(knownArtist.toLowerCase())) {
                    confidence += 0.5;
                }
            });

            // Verificar se o artista tem características do estilo
            if (this.hasArtistCharacteristics(artist, styleName)) {
                confidence += 0.2;
            }

            // Se encontrou uma correspondência melhor
            if (confidence > bestMatch.confidence) {
                bestMatch = {
                    style: styleName,
                    confidence: Math.min(confidence, 1.0),
                    bpm: this.generateBPM(config.bpmRange),
                    key: this.generateKey(),
                    mood: this.detectMood(searchText)
                };
            }
        }

        // Se a confiança ainda é baixa, tentar detecção por BPM estimado
        if (bestMatch.confidence < 0.5) {
            const estimatedBPM = this.estimateBPMFromName(searchText);
            if (estimatedBPM) {
                const styleByBPM = this.getStyleByBPM(estimatedBPM);
                if (styleByBPM) {
                    bestMatch = {
                        ...bestMatch,
                        style: styleByBPM,
                        confidence: 0.6,
                        bpm: estimatedBPM
                    };
                }
            }
        }

        return bestMatch;
    }

    private static hasArtistCharacteristics(artist: string, style: string): boolean {
        const artistLower = artist.toLowerCase();

        // Características por nacionalidade/região
        const characteristics: Record<string, string[]> = {
            'Italo Disco': ['italian', 'euro', 'giorgio', 'franco', 'mario'],
            'French House': ['justice', 'daft', 'modjo', 'cassius', 'french'],
            'UK Garage': ['uk', 'london', 'british', 'garage'],
            'German Techno': ['german', 'berlin', 'kraftwerk', 'sven']
        };

        if (characteristics[style]) {
            return characteristics[style].some((char: string) => artistLower.includes(char));
        }

        return false;
    }

    private static generateBPM(range: [number, number]): number {
        return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    }

    private static generateKey(): string {
        const keys = ['Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
        return keys[Math.floor(Math.random() * keys.length)];
    }

    private static detectMood(searchText: string): string {
        if (/\b(dark|heavy|aggressive|hard)\b/i.test(searchText)) return 'Dark';
        if (/\b(uplifting|happy|euphoric|positive)\b/i.test(searchText)) return 'Uplifting';
        if (/\b(chill|relaxed|ambient|calm)\b/i.test(searchText)) return 'Chill';
        if (/\b(energetic|party|festival|club)\b/i.test(searchText)) return 'Energetic';
        if (/\b(emotional|sad|melancholic|deep)\b/i.test(searchText)) return 'Emotional';
        return 'Neutral';
    }

    private static estimateBPMFromName(searchText: string): number | null {
        // Tentar encontrar BPM explícito no nome
        const bpmMatch = searchText.match(/\b(\d{2,3})\s*bpm\b/i);
        if (bpmMatch) {
            return parseInt(bpmMatch[1]);
        }

        // Estimar por palavras-chave de velocidade
        if (/\b(slow|chill|ambient)\b/i.test(searchText)) return 90;
        if (/\b(fast|hard|speed)\b/i.test(searchText)) return 150;
        if (/\b(drum.?bass|dnb)\b/i.test(searchText)) return 175;

        return null;
    }

    private static getStyleByBPM(bpm: number): string | null {
        if (bpm < 100) return 'Ambient';
        if (bpm < 120) return 'Downtempo';
        if (bpm < 130) return 'House';
        if (bpm < 140) return 'Techno';
        if (bpm < 160) return 'Dubstep';
        if (bpm < 180) return 'Drum & Bass';
        return 'Hardcore';
    }

    // Detecção de versão/remix mais inteligente
    static detectVersion(title: string, filename?: string): string {
        const searchText = `${title} ${filename || ''}`.toLowerCase();

        const versionPatterns = {
            'Extended Mix': /\b(extended|ext|long|full)\b/i,
            'Radio Edit': /\b(radio|edit|short|clean)\b/i,
            'Club Mix': /\b(club|dance|floor)\b/i,
            'Vocal Mix': /\b(vocal|vox|sung)\b/i,
            'Instrumental': /\b(instrumental|inst|no.?vocal)\b/i,
            'Dub Mix': /\b(dub|stripped|reduced)\b/i,
            'Remix': /\b(remix|rmx|rework|bootleg)\b/i,
            'VIP Mix': /\b(vip|exclusive|special)\b/i,
            'Acoustic': /\b(acoustic|unplugged|live)\b/i
        };

        for (const [version, pattern] of Object.entries(versionPatterns)) {
            if (pattern.test(searchText)) {
                return version;
            }
        }

        return 'Original';
    }
}
