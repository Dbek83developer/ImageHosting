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

  console.log("Файл перетащен в область!");  // Проверка

  const files = e.dataTransfer.files;
  if (files.length) {
    console.log("Файл получен:", files[0].name);  // Проверка
    handleFiles(files);
  }
});

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
});

function handleFiles(files) {
  const file = files[0];
  if (!file) return;

  console.log("Обрабатываем файл:", file.name); // Лог

  if (!['image/jpeg','image/png','image/gif', 'image/jpg'].includes(file.type)) {
    console.error("Неверный формат файла");
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

  // ✅ Добавляем отправку на сервер
  const formData = new FormData();
  formData.append("file", file);

  console.log("Отправляем файл на сервер...");

  fetch('/api/upload/', {
    method: 'POST',
    headers: {
      'Filename': file.name
    },
    body: file
  })
  .then(response => {
    if (!response.ok) throw new Error('Ошибка загрузки');
    console.log("Файл загружен успешно! Ответ сервера:", response);
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

// ✅ Копирование ссылки
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
