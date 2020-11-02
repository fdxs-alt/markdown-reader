/* eslint-disable @typescript-eslint/no-unused-vars */

import marked from "marked";
import { remote, ipcRenderer } from 'electron'
const { getFileFromUser } = remote.require('./main')
import { basename } from 'path'

window.onload = function () {
  
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

    currentWindow.setTitle(title);
  }
 
  markdownView.addEventListener("keyup", (e) => {
    const currentConent = (e.target as HTMLTextAreaElement).value;

    renderHTML(currentConent);

    updateUI(currentConent !== originalContent)
  });

  openFileButton.addEventListener('click', (e) => {
    getFileFromUser()
  })

  ipcRenderer.on('file-opened', (_, file: string, conent: string ) => {
    filePath = file;

    originalContent = conent;

    markdownView.value = conent;
    
    renderHTML(conent);

    updateUI()
  })
};

