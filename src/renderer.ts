import marked from "marked";
import { remote, ipcRenderer, shell } from "electron";
const { saveMd, saveHTML, openFile } = remote.require("./main");
import { basename } from "path";
import sanitize from "sanitize-html";

window.onload = function () {
  let filePath: string | null = null;
  let originalContent = "";
  let showHTML = false;

  document.addEventListener("dragstart", (e) => {
    e.preventDefault();
  });

  document.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  document.addEventListener("dragleave", (e) => {
    e.preventDefault();
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
  });

  const currentWindow = remote.getCurrentWindow();

  const showButton = document.querySelector(".show") as HTMLButtonElement;

  const markdownView = document.querySelector(".md") as HTMLTextAreaElement;

  const htmlView = document.querySelector(".rendered-html") as HTMLDivElement;

  const labelElement = document.querySelector("label") as HTMLLabelElement;

  const getDroppedFile = (e: DragEvent) => e.dataTransfer?.files[0];

  const isFileTypeSupported = (file: DataTransferItem | File) => {
    return ["text/plain", "text/markdown"].includes(file.type);
  };

  showButton.addEventListener("click", () => {
    showHTML = !showHTML;

    if (showHTML) {
      htmlView.classList.add("visible");
      markdownView.classList.remove("visible");
      showButton.textContent = "Show Markdown";
      labelElement.textContent = "HTML";
    } else {
      markdownView.classList.add("visible");
      htmlView.classList.remove("visible");
      showButton.textContent = "Show HTML";
      labelElement.textContent = "Markdown";
    }
  });

  markdownView.addEventListener("drop", (e) => {
    const file = getDroppedFile(e);

    if (isFileTypeSupported(file as File)) {
      openFile(file?.path);
    } else {
      alert("File not supported");
    }
  });

  const renderHTML = (markdown: string) => {
    htmlView.innerHTML = sanitize(marked(markdown));
  };

  const updateUI = (isEdited?: boolean) => {
    let title = "Markdown Reader";

    if (filePath) {
      title = `${basename(filePath)} (Edited)`;
      currentWindow.setRepresentedFilename(filePath);
    }

    if (isEdited) {
      title = `${title} - Edited`;
      currentWindow.setDocumentEdited(isEdited);
    }

    currentWindow.setTitle(title);
  };

  markdownView.addEventListener("keyup", (e) => {
    const currentConent = (e.target as HTMLTextAreaElement).value;

    renderHTML(currentConent);

    updateUI(currentConent !== originalContent);
  });

  const saveMarkdown = (): void => {
    saveMd(filePath, markdownView.value);
  };

  ipcRenderer.on("file-opened", (_, file: string, conent: string) => {
    filePath = file;

    originalContent = conent;

    markdownView.value = conent;

    renderHTML(conent);

    updateUI();
  });

  ipcRenderer.on("save-markdown", () => {
    saveMarkdown();
    originalContent = markdownView.value;
    updateUI(false);
  });

  ipcRenderer.on("open-default", () => {
    if (!filePath) {
      return;
    }
    shell.openExternal(filePath);
  });

  ipcRenderer.on("save-html", saveHTML);

  ipcRenderer.on("show-folder", () => {
    if (!filePath) {
      return;
    }
    shell.showItemInFolder(filePath);
  });
};
