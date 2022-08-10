let books = [];
const RENDER_BOOK = "render-book";
const STORAGE_KEY = "BOOK_APP";
const SAVED_BOOK = "saved-book";

document.addEventListener("DOMContentLoaded", () => {
  const submitBook = document.getElementById("inputBook");
  submitBook.addEventListener("submit", (e) => {
    e.preventDefault();
    addBook();
  });

  const searchSubmit = document.getElementById("searchBook");
  searchSubmit.addEventListener("submit", (e) => {
    e.preventDefault();
    searchBooks();
    document.dispatchEvent(new Event(RENDER_BOOK));
  });

  if (isStorageExist) {
    loadData();
  }
});

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").valueAsNumber;
  const inputBookIsComplete = document.getElementById(
    "inputBookIsComplete"
  ).checked;

  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsComplete").checked = false;

  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    title,
    author,
    year,
    inputBookIsComplete
  );
  Swal.fire({
    icon: "success",
    title: "BERHASIL MENAMBAH BUKU!",
    text: `BUKU ${title.toUpperCase()} BERHASIL DITAMBAH!`,
  });
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
}

function bookEdit(bookId) {
  const targetList = findList(bookId);
  const updateTitle = document.getElementById("editBookTitle").value;
  const updateAuthor = document.getElementById("editBookAuthor").value;
  const updateYear = document.getElementById("editBookYear").valueAsNumber;
  targetList.title = updateTitle;
  targetList.author = updateAuthor;
  targetList.year = updateYear;

  Swal.fire({
    icon: "success",
    title: "BERHASIL MENGUPDATE BUKU!",
    text: `BUKU "${targetList.title.toUpperCase()}" BERHASIL DIUPDATE!`,
  });

  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, inputBookIsComplete) {
  return {
    id,
    title,
    author,
    year,
    inputBookIsComplete,
  };
}

document.addEventListener(RENDER_BOOK, () => {
  const incompleteBookList = document.getElementById("incompleteBookshelfList");
  incompleteBookList.innerHTML = "";

  const completeBookList = document.getElementById("completeBookshelfList");
  completeBookList.innerHTML = "";

  for (const listItem of searchBooks()) {
    const listElement = makeList(listItem);
    if (!listItem.inputBookIsComplete) {
      incompleteBookList.append(listElement);
    } else {
      completeBookList.append(listElement);
    }
  }
});

function makeList(bookObject) {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = "Penulis : " + bookObject.author;

  const bookYear = document.createElement("p");
  bookYear.innerText = "Tahun : " + bookObject.year;

  const buttonAction = document.createElement("div");
  buttonAction.classList.add("action");

  const bookList = document.createElement("article");
  bookList.classList.add("book_item");
  bookList.append(bookTitle, bookAuthor, bookYear);
  bookList.append(buttonAction);
  bookList.setAttribute("id", `list-${bookObject.id}`);

  if (bookObject.inputBookIsComplete) {
    const unfinishedButton = document.createElement("button");
    unfinishedButton.innerText = "Belum selesai";
    unfinishedButton.classList.add("btn-green");

    unfinishedButton.addEventListener("click", () => {
      Swal.fire({
        icon: "question",
        title: `APAKAH ANDA YAKIN?`,
        text: `Buku "${bookObject.title.toUpperCase()}" Akan Dipindahkan ke Rak Belum Selesai Dibaca`,
        showDenyButton: true,
        denyButtonText: `Batal`,
        confirmButtonText: "Pindah",
      }).then((result) => {
        if (result.isConfirmed) {
          unfinishedFromList(bookObject.id);
        } else {
          return;
        }
      });
    });

    const editButton = document.createElement("button");
    editButton.innerText = "Edit";
    editButton.classList.add("btn-yellow");

    editButton.addEventListener("click", () => {
      Swal.fire({
        icon: "question",
        title: `APAKAH ANDA YAKIN?`,
        text: `Buku "${bookObject.title.toUpperCase()}" Akan Diedit`,
        showDenyButton: true,
        denyButtonText: `Batal`,
        confirmButtonText: "Edit",
      }).then((result) => {
        if (result.isConfirmed) {
          const edit = document.getElementById("editBookForm");
          const update = edit.cloneNode(true);
          edit.parentNode.replaceChild(update, edit);

          const newBook = document.getElementById("newBookForm");
          const editBook = document.getElementById("editBookForm");
          newBook.classList.add("hidden");
          editBook.classList.remove("hidden");

          const bookId = bookObject.id;
          const targetList = findList(bookId);

          const updateTitle = document.getElementById("editBookTitle");
          const updateAuthor = document.getElementById("editBookAuthor");
          const updateYear = document.getElementById("editBookYear");

          updateTitle.value = targetList.title;
          updateAuthor.value = targetList.author;
          updateYear.value = targetList.year;

          editBook.addEventListener("submit", (e) => {
            newBook.classList.remove("hidden");
            editBook.classList.add("hidden");
            e.preventDefault();
            bookEdit(bookObject.id);
          });
        } else {
          return;
        }
      });
    });

    const trashButton = document.createElement("button");
    trashButton.innerText = "Hapus";
    trashButton.classList.add("btn-red");

    trashButton.addEventListener("click", () => {
      Swal.fire({
        icon: "question",
        title: `APAKAH ANDA YAKIN?`,
        text: `Buku "${bookObject.title.toUpperCase()}" Akan Dihapus Dari List Buku Anda`,
        showDenyButton: true,
        denyButtonText: `Hapus`,
        confirmButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          return;
        } else {
          removeFromList(bookObject.id);
        }
      });
    });

    buttonAction.append(unfinishedButton, editButton, trashButton);
  } else {
    const finishedButton = document.createElement("button");
    finishedButton.innerText = "Selesai";
    finishedButton.classList.add("btn-blue");

    finishedButton.addEventListener("click", () => {
      Swal.fire({
        icon: "question",
        title: `APAKAH ANDA YAKIN?`,
        text: `Buku "${bookObject.title.toUpperCase()}" Akan Dipindahkan ke Rak Selesai Dibaca`,
        showDenyButton: true,
        denyButtonText: `Batal`,
        confirmButtonText: "Pindah",
      }).then((result) => {
        if (result.isConfirmed) {
          finishedFromList(bookObject.id);
        } else {
          return;
        }
      });
    });

    const editButton = document.createElement("button");
    editButton.innerText = "Edit";
    editButton.classList.add("btn-yellow");

    editButton.addEventListener("click", () => {
      Swal.fire({
        icon: "question",
        title: `APAKAH ANDA YAKIN?`,
        text: `Buku "${bookObject.title.toUpperCase()}" Akan Diedit`,
        showDenyButton: true,
        denyButtonText: `Batal`,
        confirmButtonText: "Edit",
      }).then((result) => {
        if (result.isConfirmed) {
          const edit = document.getElementById("editBookForm");
          const update = edit.cloneNode(true);
          edit.parentNode.replaceChild(update, edit);

          const newBook = document.getElementById("newBookForm");
          const editBook = document.getElementById("editBookForm");
          newBook.classList.add("hidden");
          editBook.classList.remove("hidden");

          const bookId = bookObject.id;
          const targetList = findList(bookId);

          const updateTitle = document.getElementById("editBookTitle");
          const updateAuthor = document.getElementById("editBookAuthor");
          const updateYear = document.getElementById("editBookYear");

          updateTitle.value = targetList.title;
          updateAuthor.value = targetList.author;
          updateYear.value = targetList.year;

          editBook.addEventListener("submit", (e) => {
            newBook.classList.remove("hidden");
            editBook.classList.add("hidden");
            e.preventDefault();
            bookEdit(bookObject.id);
          });
        } else {
          return;
        }
      });
    });

    const trashButton = document.createElement("button");
    trashButton.innerText = "Hapus";
    trashButton.classList.add("btn-red");

    trashButton.addEventListener("click", () => {
      Swal.fire({
        icon: "question",
        title: `APAKAH ANDA YAKIN?`,
        text: `Buku "${bookObject.title.toUpperCase()}" Akan Dihapus Dari List Buku Anda`,
        showDenyButton: true,
        denyButtonText: `Hapus`,
        confirmButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          return;
        } else {
          removeFromList(bookObject.id);
        }
      });
    });

    buttonAction.append(finishedButton, editButton, trashButton);
  }

  return bookList;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser anda tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadData() {
  const serializeData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializeData);

  if (data !== null) {
    for (const list of data) {
      books.push(list);
    }
  }

  document.dispatchEvent(new Event(RENDER_BOOK));
}

function findList(bookId) {
  for (const listItem of books) {
    if (listItem.id === bookId) {
      return listItem;
    }
  }
  return null;
}

function findListIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function finishedFromList(bookId) {
  const targetList = findList(bookId);

  if (targetList === null) return;

  targetList.inputBookIsComplete = true;

  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: "success",
    title: `BERHASIL MEMINDAHKAN BUKU "${targetList.title.toUpperCase()}"`,
  });
}

function unfinishedFromList(bookId) {
  const targetList = findList(bookId);

  if (targetList === null) return;

  targetList.inputBookIsComplete = false;

  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: "success",
    title: `BERHASIL MEMINDAHKAN BUKU "${targetList.title.toUpperCase()}"`,
  });
}

function removeFromList(bookId) {
  const targetList = findListIndex(bookId);
  const bookTitle = findList(bookId);

  if (targetList === -1) return;

  books.splice(targetList, 1);
  document.dispatchEvent(new Event(RENDER_BOOK));
  saveData();
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: "success",
    title: `BERHASIL MENGHAPUS BUKU "${bookTitle.title.toUpperCase()}"`,
  });
}

function searchBooks() {
  const listItem = document.getElementById("searchBookTitle").value;
  const searchItem = books.filter(function (book) {
    const itemBook = book.title.toLowerCase();
    return itemBook.includes(listItem.toLowerCase());
  });
  return searchItem;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_BOOK));
  }
}

document.addEventListener(SAVED_BOOK, () => {
  console.log(localStorage.getItem(STORAGE_KEY));
});
