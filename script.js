document.getElementById('searchButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (fileInput.files.length === 0) {
        alert('Por favor, carregue um arquivo zipado.');
        return;
    }

    const zip = new JSZip();
    const zipFile = fileInput.files[0];
    const zipContent = await zip.loadAsync(zipFile);

    for (const fileName in zipContent.files) {
        if (fileName.endsWith('.pdf')) {
            try {
                const fileData = await zipContent.files[fileName].async('uint8array');
                const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
                let textContent = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const text = await page.getTextContent();
                    text.items.forEach(item => {
                        textContent += item.str + ' ';
                    });
                }

                if (textContent.toLowerCase().includes(searchInput)) {
                    const resultItem = document.createElement('div');
                    resultItem.textContent = `Termo encontrado no arquivo: ${fileName}`;

                    const openButton = document.createElement('button');
                    openButton.textContent = 'Abrir PDF';
                    openButton.onclick = () => {
                        const blob = new Blob([fileData], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                    };

                    resultItem.appendChild(openButton);
                    resultsDiv.appendChild(resultItem);
                }
            } catch (error) {
                console.error(`Erro ao processar o arquivo ${fileName}:`, error);
            }
        }
    }
});

document.getElementById('searchNextWordsButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const searchNextWordsInput = document.getElementById('searchNextWordsInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (fileInput.files.length === 0) {
        alert('Por favor, carregue um arquivo zipado.');
        return;
    }

    const zip = new JSZip();
    const zipFile = fileInput.files[0];
    const zipContent = await zip.loadAsync(zipFile);

    for (const fileName in zipContent.files) {
        if (fileName.endsWith('.pdf')) {
            try {
                const fileData = await zipContent.files[fileName].async('uint8array');
                const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
                let textContent = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const text = await page.getTextContent();
                    text.items.forEach(item => {
                        textContent += item.str + ' ';
                    });
                }

                const regex = new RegExp(`\\b${searchNextWordsInput}\\b`, 'i');
                const match = regex.exec(textContent);
                if (match) {
                    const startIndex = match.index;
                    const wordsAfter = textContent.slice(startIndex).split(' ').slice(1, 4).join(' ');
                    const resultItem = document.createElement('div');
                    resultItem.textContent = `Termo encontrado no arquivo: ${fileName}, palavras seguintes: ${wordsAfter}`;

                    const openButton = document.createElement('button');
                    openButton.textContent = 'Abrir PDF';
                    openButton.onclick = () => {
                        const blob = new Blob([fileData], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                    };

                    resultItem.appendChild(openButton);
                    resultsDiv.appendChild(resultItem);
                }
            } catch (error) {
                console.error(`Erro ao processar o arquivo ${fileName}:`, error);
            }
        }
    }
});
