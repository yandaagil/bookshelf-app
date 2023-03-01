document.addEventListener('DOMContentLoaded', function() {
	const submitForm = document.getElementById('inputBook');
  const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
  const alert = () => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
      `<div class="alert alert-success alert-dismissible mt-3 mb-0 d-flex align-items-center" role="alert">`,
      `   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>`,
      `    <div>Buku baru telah berhasil ditambahkan!</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      '</div>'
    ].join('')
  
    alertPlaceholder.append(wrapper)
  }
  
	submitForm.addEventListener('submit', function(event) {
    event.preventDefault();
		addBook();
    alert();
    submitForm.reset();
	});

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
	const title = document.getElementById('inputBookTitle').value;
	const author = document.getElementById('inputBookAuthor').value;
	const year = document.getElementById('inputBookYear').value;
  const complete = document.getElementById('inputBookIsComplete').checked;
	
	const generatedID = generateId();
	const bookObject = generateBookObject(generatedID, title, author, year, complete);
	books.push(bookObject);
	
	document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

function generateId() {
	return +new Date();
};

function changeAddText() {
  const checkbox = document.getElementById('inputBookIsComplete').checked;

  if (checkbox) {
    document.querySelector('.check-text').innerHTML = 'Selesai dibaca';
  } else {
    document.querySelector('.check-text').innerHTML = 'Belum selesai dibaca';
  }
}

function generateBookObject(id, title, author, year, isComplete) {
	return {
		id,
		title,
		author,
		year,
		isComplete
	};
};

const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener(RENDER_EVENT, function() {
  const uncompletedBOOKList = document.getElementById('incompleteBookshelfList');
  uncompletedBOOKList.innerHTML = '';

  const completedBOOKList = document.getElementById('completeBookshelfList');
  completedBOOKList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);

    if (!bookItem.isComplete) {
      uncompletedBOOKList.append(bookElement);
    } else {
      completedBOOKList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement('h5');
  textTitle.classList.add('mb-1');
  textTitle.innerText = bookObject.title;

  const containerJudul = document.createElement('div');
  let classJudul = "d-flex w-100 justify-content-between".split(' ');
  containerJudul.classList.add(...classJudul);
  containerJudul.append(textTitle);
  
  const textAuthor = document.createElement('p');
  textAuthor.classList.add('mb-1')
  textAuthor.innerText = bookObject.author;
  
  const textYear = document.createElement('small');
  textYear.classList.add('text-muted')
  textYear.innerText = bookObject.year;
  
  const content = document.createElement('div');
  content.classList.add('me-auto');
  content.append(containerJudul, textAuthor, textYear);

  const group = document.createElement('div');
  let classGroup = "list-group-item flex-column".split(' ');
  group.classList.add(...classGroup);
  group.append(content);
  group.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('btn');
    undoButton.classList.add('btn-warning');
    undoButton.classList.add('me-1');
    undoButton.innerText = 'Belum selesai dibaca'

    undoButton.addEventListener('click', function() {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('bi');
    trashIcon.classList.add('bi-trash-fill');
    trashButton.classList.add('btn');
    trashButton.classList.add('btn-danger');
    trashButton.append(trashIcon);

    trashButton.addEventListener('click', function() {
      removeBookFromCompleted(bookObject.id);
    });

    const buttonContainer = document.createElement('div');
    let classButton = "d-flex justify-content-end".split(' ');
    buttonContainer.classList.add(...classButton);
    buttonContainer.append(undoButton, trashButton);

    group.append(buttonContainer);
  } else {
    const doneButton = document.createElement('button');
    doneButton.classList.add('btn');
    doneButton.classList.add('btn-success');
    doneButton.classList.add('me-1');
    doneButton.innerText = 'Selesai dibaca'

    doneButton.addEventListener('click', function() {
      addBookToCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('bi');
    trashIcon.classList.add('bi-trash-fill');
    trashButton.classList.add('btn');
    trashButton.classList.add('btn-danger');
    trashButton.append(trashIcon);

    trashButton.addEventListener('click', function() {
      removeBookFromCompleted(bookObject.id);
    });

    const buttonContainer = document.createElement('div');
    let classButton = "d-flex justify-content-end".split(' ');
    buttonContainer.classList.add(...classButton);
    buttonContainer.append(doneButton, trashButton);

    group.append(buttonContainer);
  }
  
  return group;
}

function findBookTitle() {
  const input = document.getElementById('cari').value.toLowerCase();
  const item = document.getElementsByClassName('list-group-item');

  for (let i = 0; i < item.length; i++) {
    const h5 = item[i].getElementsByTagName('h5')[0]
    if (h5.innerHTML.toLowerCase().includes(input)) {
      item[i].style.display = '';
    } else {
      item[i].style.display = 'none';
    }
  }
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id == bookId) return bookItem;
  }

  return null
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  Swal.fire({
    title: 'Apakah anda yakin ingin menghapusnya?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, hapus'
  }).then((result) => {
    if (result.isConfirmed) {
      books.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();

      Swal.fire(
        'Dihapus!',
        'Buku telah dihapus',
        'success'
      )
    }
  })
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) return index;
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK';

function isStorageExist() {
  if (typeof(Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }

  return true;
}

document.addEventListener(SAVED_EVENT, function() {
  console.log(localStorage.getItem(STORAGE_KEY));
})

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}