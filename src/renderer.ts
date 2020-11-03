/* eslint-disable @typescript-eslint/no-unused-vars */

import marked from "marked";
import { remote, ipcRenderer, shell } from 'electron'
const { getFileFromUser, saveMd, saveHTML, openFile } = remote.require('./main')
import { basename } from 'path'

window.onload = function () {
  

  document.addEventListener('dragstart', (e) => {
    e.preventDefault()
  })

  document.addEventListener('dragover', (e) => {
    e.preventDefault()
  })

  document.addEventListener('dragleave', (e) => {
    e.preventDefault()
  })

  document.addEventListener('drop', (e) => {
    e.preventDefault()
  })

  let filePath: string | null = null;
  let originalContent = '';

  const currentWindow = remote.getCurrentWindow();

  const openFileButton = document.querySelector('.open-file') as HTMLButtonElement;
  
  const saveFileButton = document.querySelector('.save-file') as HTMLButtonElement;
  
  const revertButton = document.querySelector('.revert') as HTMLButtonElement;
  
  const saveHTMLButton = document.querySelector('.save-html') as HTMLButtonElement;
  
  const showFileButton = document.querySelector('.show-file') as HTMLButtonElement
  
  const openInDefaultButton = document.querySelector('.open-default') as HTMLButtonElement;
  
  const markdownView = document.querySelector("#md") as HTMLTextAreaElement;
  
  const htmlView = document.querySelector(".rendered-html") as HTMLDivElement;
  
  const newFileButton = document.querySelector('.new-file') as HTMLButtonElement;

  const getDraggedFile = (e: DragEvent) => e.dataTransfer?.items[0]

  const getDroppedFile = (e: DragEvent) => e.dataTransfer?.files[0]

  const isFileTypeSupported = (file: DataTransferItem | File ) => {
    return ['text/plain', 'text/markdown'].includes(file.type)
  }

  markdownView.addEventListener('dragover', (e) => {
    const file = getDraggedFile(e)
    if(isFileTypeSupported(file as DataTransferItem)) {
      markdownView.classList.add('drag-over')
    }
    else {
      markdownView.classList.add('drag-error')
    }
  })

  markdownView.addEventListener('dragleave', (e) => {
    markdownView.classList.remove('drag-over')
    markdownView.classList.remove('drag-error')
  })

  markdownView.addEventListener('drop', (e) => {
    const file = getDroppedFile(e);

    if(isFileTypeSupported(file as File)) {
      openFile(file?.path)
    }   
    else {
      alert('File not supported');
    }

    markdownView.classList.remove('drag-over')
    markdownView.classList.remove('drag-error')
  })

  const renderHTML = (markdown: string) => {
    htmlView.innerHTML = marked(markdown);
  };

  const updateUI = (isEdited?: boolean) => {
    let title = 'Markdown Reader'

    if(filePath) {
      title = `${basename(filePath)} (Edited)`
      currentWindow.setRepresentedFilename(filePath)
    }

    if(isEdited) {
      title = `${title} - Edited`
      currentWindow.setDocumentEdited(isEdited);
    }

    saveFileButton.disabled = !isEdited;
    revertButton.disabled = !isEdited;

    showFileButton.disabled = !filePath;
    openInDefaultButton.disabled = !filePath;

    currentWindow.setTitle(title);
  }
 
  markdownView.addEventListener("keyup", (e) => {
    const currentConent = (e.target as HTMLTextAreaElement).value;

    renderHTML(currentConent);

    updateUI(currentConent !== originalContent)
  });

  saveFileButton.addEventListener('click', (e) => {
    saveMd(filePath, markdownView.value);
  })

  openFileButton.addEventListener('click', (e) => {
    getFileFromUser()
  })

  saveHTMLButton.addEventListener('click', () => {
    saveHTML(htmlView.innerHTML)
  })

  showFileButton.addEventListener('click', () => {
    if(!filePath) {
      alert('No filepath')
    }
    else {
      shell.showItemInFolder(filePath)
    }
  });

  openInDefaultButton.addEventListener('click', () => {
    if(!filePath) {
      alert('No filepath')
    }
    else {
      shell.openExternal(filePath)
    }
  })

  ipcRenderer.on('file-opened', (_, file: string, conent: string ) => {
    filePath = file;

    originalContent = conent;

    markdownView.value = conent;
    
    renderHTML(conent);

    updateUI()
  })


  
};

