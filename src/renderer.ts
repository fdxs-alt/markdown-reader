/* eslint-disable @typescript-eslint/no-unused-vars */

import marked from "marked";

window.onload = function () {
  
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

  markdownView.addEventListener("keyup", (e) => {
    const currentConent = (e.target as HTMLTextAreaElement).value;
    renderHTML(currentConent);
  });
};