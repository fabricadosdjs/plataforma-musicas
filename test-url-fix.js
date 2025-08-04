// Teste simples de correção de URLs do Contabo Storage

function fixContaboUrl(url) {
    console.log('🔧 Iniciando correção de URL:', url);

    if (!url || !url.includes('contabostorage.com')) {
        console.log('❌ Não é URL do Contabo');
        return url;
    }

    // Extrair o key do URL
    const urlParts = url.split('/');
    const bucketAndKey = urlParts.slice(3).join('/');
    console.log('Bucket e Key:', bucketAndKey);

    // Separar o bucket do key
    const bucketSeparator = bucketAndKey.indexOf(':');
    if (bucketSeparator === -1) {
        console.log('❌ URL malformado:', url);
        return url;
    }

    const bucket = bucketAndKey.substring(0, bucketSeparator);
    const key = bucketAndKey.substring(bucketSeparator + 1);
    console.log('Bucket:', bucket);
    console.log('Key:', key);

    // Decodificar o key atual
    let decodedKey;
    try {
        decodedKey = decodeURIComponent(key);
    } catch (e) {
        decodedKey = key;
    }
    console.log('Key decodificado:', decodedKey);

    // Separar caminho e nome do arquivo
    const keyParts = decodedKey.split('/');
    const fileName = keyParts.pop();
    const path = keyParts.join('/');
    console.log('Path:', path);
    console.log('FileName:', fileName);

    // Codificar apenas o nome do arquivo
    const encodedFileName = encodeURIComponent(fileName);
    const encodedKey = path ? `${path}/${encodedFileName}` : encodedFileName;
    console.log('EncodedFileName:', encodedFileName);
    console.log('EncodedKey:', encodedKey);

    // Reconstruir o URL
    const fixedUrl = `https://usc1.contabostorage.com/${bucket}:${encodedKey}`;
    console.log('Fixed URL:', fixedUrl);

    return fixedUrl;
}

// Teste
const testUrl = "https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/04.08.2025/EL SIMBOLO - NO TE PREOCUPES (ERNANI REMIX).mp3";
const expectedUrl = "https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/04.08.2025/EL%20SIMBOLO%20-%20NO%20TE%20PREOCUPES%20(ERNANI%20REMIX).mp3";

console.log('🧪 Testando correção de URL:');
console.log('URL de teste:', testUrl);
console.log('URL esperado:', expectedUrl);
console.log('');

const fixedUrl = fixContaboUrl(testUrl);

console.log('');
console.log('URL corrigido:', fixedUrl);

if (fixedUrl === expectedUrl) {
    console.log('✅ Teste passou!');
} else {
    console.log('❌ Teste falhou!');
} 