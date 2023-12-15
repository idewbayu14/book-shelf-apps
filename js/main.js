const books = [];
const RENDER_BOOK = "render-book";
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK-SHELF';

let searchBook = [];

// Event listener untuk menangani peristiwa ketika DOM telah dimuat
document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById("inputBook")
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
      loadDataFromStorage();
    }
});

// Fungsi untuk menambahkan buku ke daftar buku
function addBook () {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = parseInt(document.getElementById("inputBookYear").value);
  const checkBook = document.getElementById("inputBookIsComplete").checked

  const generateID = generateId();
  const bookObject = generateBookObject(generateID, bookTitle, bookAuthor, bookYear, checkBook)

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
  
  document.getElementById("inputBookTitle").value= ''
  document.getElementById("inputBookAuthor").value= ''
  document.getElementById("inputBookYear").value= ''
  document.getElementById("inputBookIsComplete").checked= false
};

// Fungsi untuk menyimpan data buku ke penyimpanan lokal
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Fungsi untuk memeriksa apakah penyimpanan lokal tersedia
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser Anda tidak mendukung local storage');
    return false;
  }
  return true;
}

// Fungsi untuk memuat data buku dari penyimpanan lokal
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_BOOK));
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

// Fungsi untuk menghasilkan ID unik berdasarkan timestamp
function generateId() {
    return +new Date();
} 

// Fungsi untuk menghasilkan objek buku
function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  };
}

// Fungsi untuk mencari indeks buku dalam daftar buku
function findBookIndex (bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

// Fungsi untuk memindahkan buku ke daftar selesai dibaca
function addBookToCompleted (bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
}

// Fungsi untuk membatalkan buku dari daftar selesai dibaca
function UndoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  const searchBookTarget = findBookIndex(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  if(searchBook.length > 0) {
    searchBookTarget.isCompleted = false;
  }

  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
}

const inputSearchBook = document.getElementById('searchBookTitle')
const searchSubmitButton = document.getElementById('searchSubmit')

searchSubmitButton.addEventListener('click', function(event){
  event.preventDefault()
  const text = inputSearchBook.value  
  
  searchBook.length = 0;

  searchBook = books.filter(book  => book.title.toUpperCase().includes(text.toUpperCase()))
  console.log(searchBook);
  document.dispatchEvent(new Event(RENDER_BOOK))
});

// Fungsi untuk membuat elemen buku dari objek buku
function makeBook(bookObject){
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;
  
    const textAuthor = document.createElement("p");
    textAuthor.innerText = `Author  : ${bookObject.author}`;
  
    const textYear = document.createElement("p");
    textYear.innerText =   `Year    : ${bookObject.year}`;
  
  
    const textContainer = document.createElement("div");
    textContainer.classList.add("book");
    textContainer.append(textTitle, textAuthor, textYear)
  
    const container = document.createElement("article");
    container.classList.add("book_item")
    textContainer.setAttribute("id", `book-${bookObject.id}`)
    container.append(textTitle, textAuthor, textYear)
  
    if (bookObject.isCompleted) {
      const undoButton = document.createElement('button');
      undoButton.classList.add('green');
      undoButton.innerText = "Belum selesai dibaca"
   
      undoButton.addEventListener('click', function () {
        UndoBookFromCompleted(bookObject.id);
      });
   
      const removeButton = document.createElement('button');
      removeButton.classList.add('red');
      removeButton.innerText = "Hapus buku"
   
      removeButton.addEventListener('click', function () {
        var confirmation = prompt("Apakah Anda yakin ingin menghapus buku ini? Ketik 'Ya' untuk konfirmasi.");
      
        if (confirmation === 'Ya') {
          removeBookFromCompleted(bookObject.id);
        } else {
          alert("Penghapusan dibatalkan.");
        }
      });
      
      container.append(undoButton, removeButton);
      
    } else {
      const completeButton = document.createElement('button');
      completeButton.classList.add('green');
      completeButton.innerText = "Selesai dibaca"
      
      completeButton.addEventListener('click', function () {
        addBookToCompleted(bookObject.id);
      });
  
      const removeButton = document.createElement('button');
      removeButton.classList.add('red');
      removeButton.innerText = "Hapus buku"
   
      removeButton.addEventListener('click', function () {
        var confirmation = prompt("Apakah Anda yakin ingin menghapus buku ini? Ketik 'Ya' untuk konfirmasi.");
      
        if (confirmation === 'Ya') {
          removeBookFromCompleted(bookObject.id);
        } else {
          alert("Penghapusan dibatalkan.");
        }
      });
  
      container.append(completeButton, removeButton);
      
    }
  
    return container
}

// Fungsi untuk mencari objek buku berdasarkan ID
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id == bookId) {
      return bookItem;
    }
  }
  return null;
}

// Fungsi untuk menghapus buku dari daftar selesai dibaca
function removeBookFromCompleted (bookId) {
  const bookTarget = findBookIndex(bookId);
  const searchBookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  if(searchBook.length > 0) {
    searchBook.splice(searchBookTarget, 1);
  }
  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
}

document.addEventListener(RENDER_BOOK, function () {
    const inCompleteBook = document.getElementById('incompleteBookshelfList');
    inCompleteBook.innerHTML = '';

    const completeBook = document.getElementById('completeBookshelfList');
    completeBook.innerHTML = '';

    const searchMenu = document.getElementById('bookInfo');
    searchMenu.innerHTML = '';
    
    if (inputSearchBook.value.length > 0) {
      for (const bookItem of searchBook) {
        const bookElement = makeBook(bookItem);
        if (!bookElement.isCompleted) {
          inCompleteBook.append(bookElement);
          searchBook.append(bookElement);
        } else {
          completeBook.append(bookElement);
        }
      }
    }

    for (const bookItem of books) {    
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) {
          inCompleteBook.append(bookElement);
        } else {
          completeBook.append(bookElement);
        }
    }

}); 