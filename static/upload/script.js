const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');
const browseButton = document.getElementById('browseButton');
const uploadUrlInput = document.getElementById('uploadUrl');
const copyButton = document.getElementById('copyButton');

browseButton.addEventListener('click', () => {
  fileInput.click();
});

dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.classList.remove('dragover');

  const files = e.dataTransfer.files;
  if (files.length) {
    handleFiles(files);
  }
});

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
});

function handleFiles(files) {
  const file = files[0];
  if (!file) return;

  if (!['image/jpeg','image/png','image/gif', 'image/jpg'].includes(file.type)) {
    dropArea.classList.add('error');
    dropArea.classList.remove('success');
    alert("Invalid file type. Only JPG, PNG, and GIF are allowed.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    console.error("Файл слишком большой");
    dropArea.classList.add('error');
    dropArea.classList.remove('success');
    alert("File is too large. Max size is 5MB.");
    return;
  }

  dropArea.classList.remove('error');

  //  Добавляем отправку на сервер
  const formData = new FormData();
  formData.append("file", file);

  fetch('/api/upload/', {
    method: 'POST',
    headers: {
      'Filename': file.name
    },
    body: file
  })
  .then(response => {
    if (!response.ok) throw new Error('Ошибка загрузки');
    return response;
  })
  .then(response => {
    uploadUrlInput.value = response.headers.get('Location');
    copyButton.disabled = false;
    dropArea.classList.add('success');
    alert("Файл загружен!");
  })
  .catch(error => {
    console.error('Ошибка загрузки:', error);
    dropArea.classList.add('error');
    alert("Ошибка загрузки файла.");
  });
}

// Копирование ссылки
copyButton.addEventListener('click', () => {
  navigator.clipboard.writeText(uploadUrlInput.value)
    .then(() => {
      copyButton.textContent = 'Copied!';
      copyButton.style.backgroundColor = '#7B7B7B';
      setTimeout(() => {
        copyButton.innerHTML = '<img src="copy.png" alt="Copy" width="20" height="20">';
        copyButton.style.backgroundColor = '#007BFF';
      }, 1000);
    })
    .catch((err) => {
      console.error('Failed to copy:', err);
    });
});

document.getElementById('btnGoToImages').addEventListener('click', () => {
    window.location.href = '/images/';
});
