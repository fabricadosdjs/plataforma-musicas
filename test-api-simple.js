// Script simples para testar a API
const testData = {
    userId: 'cmdlzbz3d0000ty9g6ld7w6ft',
    customBenefits: {
        packRequests: {
            limit: 8,
            enabled: true
        },
        playlistDownloads: {
            limit: 12,
            enabled: true
        },
        driveAccess: {
            enabled: true
        }
    }
};

console.log('📤 Testando API com dados:', JSON.stringify(testData, null, 2));

fetch('http://localhost:3001/api/admin/update-custom-benefits', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
})
    .then(response => {
        console.log('📡 Status:', response.status);
        return response.text();
    })
    .then(data => {
        console.log('📡 Resposta:', data);
    })
    .catch(error => {
        console.error('❌ Erro:', error);
    }); 