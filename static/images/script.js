const tbody = document.getElementById('imagesTableBody');

fetch('/api/images')
    .then(response => response.json())
    .then(images => setImages(images.images))
    .catch(error => console.error('Ошибка загрузки изображений:', error));

function setImages(images) {
    tbody.innerHTML = '';
    images.forEach(image => {
        const tr = document.createElement('tr');
        const tdPreview = document.createElement('td');
        const tdUrl = document.createElement('td');
        const tdDelete = document.createElement('td');

        const deleteButton = document.createElement('button');
        deleteButton.setAttribute('type', 'button');
        deleteButton.classList.add('delete-btn');
        deleteButton.textContent = 'X';
        deleteButton.addEventListener('click', () => deleteImage(image, tr));

        tdDelete.appendChild(deleteButton);
        tdPreview.innerHTML = `<img src="/images/${image}" width="42" height="100%" alt="Image ${image}" title="Image ${image}">`;
        tdUrl.innerHTML = `<a href="/images/${image}" target="_blank">${image}</a>`;

        tr.appendChild(tdPreview);
        tr.appendChild(tdUrl);
        tr.appendChild(tdDelete);
        tbody.appendChild(tr);
    });
}

// Функция удаления изображения с сервера
function deleteImage(imageName, row) {
    fetch('/delete/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: imageName })
    })
    .then(response => {
        if (response.ok) {
            row.remove();
        } else {
            alert('Ошибка удаления изображения');
        }
    })
    .catch(error => console.error('Ошибка при удалении:', error));
}

document.getElementById('btnGoToUpload').addEventListener('click', () => {
    window.location.href = '/upload/';
});
