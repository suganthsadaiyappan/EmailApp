//Reading DOM elements
const logoutButton = document.querySelector(".logout");
const section2 = document.querySelector(".section2");
const section3 = document.querySelector(".section3");
const mailItemFrom = document.querySelector(".mail-item-from");
const mailItemTime = document.querySelector(".mail-item-time");
const mailItemBody = document.querySelector(".mail-item-body");
const mailItemSubject = document.querySelector(".mail-item-subject");
const mailItemDelete = document.querySelector(".mail-item-delete");
const mailItemRestore = document.querySelector(".mail-item-restore");
const mailitem = document.querySelector(".mail-item");
const inbox = document.querySelector(".inbox");
const sent = document.querySelector(".sent");
const drafts = document.querySelector(".drafts");
const trash = document.querySelector(".trash");
const compose = document.querySelector(".compose");
const bodyContainer = document.querySelector(".body-container");
const composeContainer = document.querySelector(".compose-container");
const send = document.querySelector(".send");
const closePopup = document.querySelector(".compose-header-close");
const composeTo = document.querySelector("#composeTo");
const composeSubject = document.querySelector("#composeSubject");
const composeBody = document.querySelector("#composeBody");
const deleteButton = document.querySelector(".mail-item-delete");
const notifications = document.querySelector(".notifications");
const unreadMail = document.querySelectorAll(".unread");

//Declaring timer variables
let inboxTimerID, trashTimerID, sentTimerID, draftsTimerID;

// Function to create alert element to display error
function createAlertElement(content) {
  const alert = document.querySelector(".alert");
  if (alert) {
    alert.remove();
  }
  const alertDiv = document.createElement("div");
  alertDiv.classList.add(
    "alert",
    "alert-warning",
    "alert-dismissible",
    "fade",
    "show"
  );
  alertDiv.innerHTML = content;
  const closeButton = document.createElement("button");
  closeButton.setAttribute("type", "button");
  closeButton.setAttribute("class", "close");
  closeButton.setAttribute("data-dismiss", "alert");
  closeButton.setAttribute("aria-label", "Close");
  const closeIcon = document.createElement("span");
  closeIcon.setAttribute("aria-hidden", "true");
  closeIcon.innerHTML = "&times;";
  closeButton.appendChild(closeIcon);
  alertDiv.appendChild(closeButton);
  const tabContent = document.querySelector(".tab-content");
  composeContainer.appendChild(alertDiv);
}

//Function to handle logout feature
function logoutUser() {
  logoutButton.addEventListener("click", async function () {
    const url = "http://localhost:3000/email";
    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    window.location.replace("http://localhost:3000/");
  });
}

//Function to handle folder click , add animation , section 1
function handleFolderClick() {
  const buttons = Array.from(document.querySelectorAll(".section1 button"));
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      buttons.forEach((btn) => {
        if (btn.classList.contains("btn-primary")) {
          btn.classList.replace("btn-primary", "btn-secondary");
        }
      });
      button.classList.add("active");
      button.classList.replace("btn-secondary", "btn-primary");
    });
  });
}

//Helper function to clear interval timerid's
function clearIntervalHelper(...args) {
  for (let i = 0; i < args.length; i++) {
    clearInterval(args[i]);
  }
}

//Function to populate mailbox on folder click in section 1
function populateMailboxOnFolderClick() {
  inbox.addEventListener("click", function () {
    clearIntervalHelper(trashTimerID, sentTimerID, draftsTimerID);
    removeMailDetails();
    fetchInbox();
  });
  trash.addEventListener("click", function () {
    clearIntervalHelper(inboxTimerID, sentTimerID, draftsTimerID);
    removeMailDetails();
    fetchTrash();
  });
  sent.addEventListener("click", function () {
    clearIntervalHelper(inboxTimerID, trashTimerID, draftsTimerID);
    removeMailDetails();
    fetchSent();
  });
  drafts.addEventListener("click", function () {
    clearIntervalHelper(inboxTimerID, trashTimerID, sentTimerID);
    removeMailDetails();
    fetchDrafts();
  });
}

//Function to handle send button in drafts folder , send the mail and delete the mail in the draft folder
function handleSendButton() {
  const button = document.createElement("button");
  button.setAttribute("id", "send");
  button.setAttribute("class", "send btn btn-lg btn-success");
  button.textContent = "Send";
  mailItemBody.appendChild(button);
  button.addEventListener("click", async function () {
    const url = " http://localhost:3000/sent";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: `${mailItemSubject.textContent}`,
        body: `${mailItemBody.textContent.split("Send")[0]}`,
        to: `${mailItemFrom.textContent.split(": ")[1]}`,
      }),
    });
    await response.json();
    removeMailDetails();
    removeItem(Number(deleteButton.getAttribute("id")));
  });
}

//Function to create mail list in section 2
function createMailList(
  subject,
  body,
  from,
  receivedTime,
  index,
  status = "read"
) {
  const mailList = document.createElement("div");

  mailList.classList.add(`mail-list`);
  mailList.classList.add(`mail-list-${index}`);

  if (status === "read") {
    mailList.classList.remove(`unread`);
  } else {
    mailList.classList.add(`unread`);
  }

  const fromTime = document.createElement("div");
  fromTime.classList.add("from-time", "flex");

  const fromElement = document.createElement("div");
  fromElement.classList.add("from", "font-weight-700");
  fromElement.textContent = from;
  fromTime.appendChild(fromElement);

  const time = document.createElement("div");
  time.classList.add("time");
  time.textContent = receivedTime;
  fromTime.appendChild(time);

  mailList.appendChild(fromTime);

  const subjectElement = document.createElement("div");
  subjectElement.classList.add("subject", "font-weight-500");
  subjectElement.textContent = subject;
  mailList.appendChild(subjectElement);

  const mailListBody = document.createElement("div");
  mailListBody.classList.add("mail-list-body");
  mailListBody.textContent = body;
  mailList.appendChild(mailListBody);
  section2.appendChild(mailList);

  return mailList;
}

//Function to remove the mail lists for rerendering in section 2
function removeMailList() {
  let mailList = document.querySelectorAll(".mail-list");
  if (mailList) {
    mailList.forEach((mailList) => {
      mailList.remove();
    });
  }
}

//Function to fetch inbox
async function fetchInbox() {
  const url = "http://localhost:3000/inbox";
  const response = await fetch(url);
  const data = await response.json();
  removeMailList();
  readNotifications();
  if (data.inbox.length !== 0) {
    data.inbox.forEach((data) => {
      let mailList = createMailList(
        data.subject,
        data.body,
        data.from,
        data.time,
        data.id,
        data.status
      );
      mailList.addEventListener("click", function (e) {
        let mailListItems = document.querySelectorAll(".mail-list");
        mailListItems.forEach((mailList) => {
          mailList.classList.remove("active");
        });
        updateNotifications(data.id);
        e.currentTarget.classList.add("active");
        e.currentTarget.classList.remove("unread");
        let time = e.currentTarget.querySelector(".time").textContent;
        let body = e.currentTarget.querySelector(".mail-list-body").textContent;
        let subject = e.currentTarget.querySelector(".subject").textContent;
        let from = e.currentTarget.querySelector(".from").textContent;
        updateMailDetails(
          time,
          body,
          subject,
          from,
          `<img src="../assets/delete.png" alt="" srcset="">`,
          "from",
          data.id,
          "inbox"
        );
      });
    });
  }
  if (inbox.classList.contains("active")) {
    clearInterval(inboxTimerID);
    inboxTimerID = setInterval(async () => {
      fetchInbox();
    }, 10000);
  }
}

// Function to fetch trash
async function fetchTrash() {
  const url = "http://localhost:3000/trash";
  const response = await fetch(url);
  const data = await response.json();
  removeMailList();
  if (data.trash.length !== 0) {
    data.trash.forEach((data, index) => {
      let mailList = createMailList(
        data.subject,
        data.body,
        data.from ? data.from : data.to,
        data.time,
        data.id
      );

      mailList.addEventListener("click", function (e) {
        let mailListItems = document.querySelectorAll(".mail-list");
        mailListItems.forEach((mailList) => {
          mailList.classList.remove("active");
        });
        e.currentTarget.classList.remove("unread");
        e.currentTarget.classList.add("active");
        let time = e.currentTarget.querySelector(".time").textContent;
        let body = e.currentTarget.querySelector(".mail-list-body").textContent;
        let subject = e.currentTarget.querySelector(".subject").textContent;
        let from = e.currentTarget.querySelector(".from").textContent;
        updateMailDetails(
          time,
          body,
          subject,
          from,
          `<img src="../assets/delete.png" alt="" srcset="">`,
          data.from ? "from" : "to",
          data.id,
          "trash"
        );
      });
    });
  }
  if (trash.classList.contains("active")) {
    clearInterval(trashTimerID);
    trashTimerID = setInterval(async () => {
      fetchTrash();
    }, 10000);
  }
}

//Function to fetch sent
async function fetchSent() {
  const url = "http://localhost:3000/sent";
  const response = await fetch(url);
  const data = await response.json();
  removeMailList();
  if (data.sent.length !== 0) {
    data.sent.forEach((data, index) => {
      let mailList = createMailList(
        data.subject,
        data.body,
        data.to,
        data.time,
        data.id
      );

      mailList.addEventListener("click", function (e) {
        let mailListItems = document.querySelectorAll(".mail-list");
        mailListItems.forEach((mailList) => {
          mailList.classList.remove("active");
        });
        e.currentTarget.classList.add("active");
        e.currentTarget.classList.remove("unread");
        let time = e.currentTarget.querySelector(".time").textContent;
        let body = e.currentTarget.querySelector(".mail-list-body").textContent;
        let subject = e.currentTarget.querySelector(".subject").textContent;
        let from = e.currentTarget.querySelector(".from").textContent;
        updateMailDetails(
          time,
          body,
          subject,
          from,
          `<img src="../assets/delete.png" alt="" srcset="">`,
          "to",
          data.id,
          "sent"
        );
      });
    });
  }
  if (sent.classList.contains("active")) {
    clearInterval(sentTimerID);
    sentTimerID = setInterval(async () => {
      fetchSent();
    }, 10000);
  }
}

//Function to fetch drafts
async function fetchDrafts() {
  const url = "http://localhost:3000/drafts";
  const response = await fetch(url);
  const data = await response.json();
  removeMailList();
  if (data.drafts.length !== 0) {
    data.drafts.forEach((data, index) => {
      let mailList = createMailList(
        data.subject,
        data.body,
        data.to,
        data.time,
        data.id
      );
      mailList.addEventListener("click", function (e) {
        let mailListItems = document.querySelectorAll(".mail-list");
        mailListItems.forEach((mailList) => {
          mailList.classList.remove("active");
        });
        e.currentTarget.classList.add("active");
        e.currentTarget.classList.remove("unread");
        let time = e.currentTarget.querySelector(".time").textContent;
        let body = e.currentTarget.querySelector(".mail-list-body").textContent;
        let subject = e.currentTarget.querySelector(".subject").textContent;
        let from = e.currentTarget.querySelector(".from").textContent;
        updateMailDetails(
          time,
          body,
          subject,
          from,
          `<img src="../assets/delete.png" alt="" srcset="">`,
          "to",
          data.id,
          "drafts"
        );
        handleSendButton();
      });
    });
  }
  if (drafts.classList.contains("active")) {
    clearInterval(draftsTimerID);
    draftsTimerID = setInterval(async () => {
      fetchDrafts();
    }, 10000);
  }
}

//Function to update the mailitem in section 3
function updateMailDetails(
  time,
  body,
  subject,
  from,
  deleteImage,
  fromOrTo,
  index,
  folder,
  restoreImage = `<img src="../assets/restore.png" alt="" srcset="">`
) {
  mailitem.classList.replace(`mail-item-${index}`, `mail-item-${index}`);
  mailItemBody.innerHTML = body;
  mailItemFrom.innerHTML =
    fromOrTo === "from" ? "From : " + from : "To : " + from;
  mailItemSubject.innerHTML = subject;
  mailItemTime.innerHTML = time;
  mailItemDelete.innerHTML = deleteImage;
  if (folder === "trash") {
    mailItemRestore.innerHTML = restoreImage;
  }
  mailItemDelete.setAttribute("id", index);
  mailItemRestore.setAttribute("id", "restore_" + index);
}

//function to remove mail details when changing folders
function removeMailDetails() {
  mailItemBody.innerHTML = "";
  mailItemFrom.innerHTML = "";
  mailItemSubject.innerHTML = "";
  mailItemTime.innerHTML = "";
  mailItemDelete.innerHTML = "";
  mailItemRestore.innerHTML = "";
}

//Function to handle compose , send , close popup button
function handleNewMail() {
  compose.addEventListener("click", function () {
    bodyContainer.style.filter = "blur(10px)";
    bodyContainer.style.pointerEvents = "none";
    composeContainer.style.visibility = "visible";
  });
  send.addEventListener("click", async function () {
    const url = " http://localhost:3000/sent";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: `${composeSubject.value}`,
        body: `${composeBody.value}`,
        to: `${composeTo.value}`,
      }),
    });
    const data = await response.json();
    if (data === "Success, mail sent") {
      bodyContainer.style.filter = "none";
      bodyContainer.style.pointerEvents = "auto";
      composeContainer.style.visibility = "hidden";
      sent.dispatchEvent(new Event("click"));
      fetchSent();
      composeSubject.value = "";
      composeBody.value = "";
      composeTo.value = "";
    } else {
      createAlertElement(data);
    }
  });
  closePopup.addEventListener("click", async function () {
    if (
      composeSubject.value !== "" &&
      composeBody.value !== "" &&
      composeTo.value !== ""
    ) {
      if (confirm("Do you want to save this to the drafts?")) {
        const url = " http://localhost:3000/drafts";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: `${composeSubject.value}`,
            body: `${composeBody.value}`,
            to: `${composeTo.value}`,
          }),
        });
        const data = await response.json();
        if (data === "Success, draft saved") {
          composeContainer.style.visibility = "hidden";
          bodyContainer.style.filter = "none";
          bodyContainer.style.pointerEvents = "auto";
          drafts.dispatchEvent(new Event("click"));
          fetchDrafts();
          composeSubject.value = "";
          composeBody.value = "";
          composeTo.value = "";
        } else {
          createAlertElement(data);
        }
      } else {
        composeContainer.style.visibility = "hidden";
        bodyContainer.style.filter = "none";
        bodyContainer.style.pointerEvents = "auto";
      }
    } else {
      composeContainer.style.visibility = "hidden";
      bodyContainer.style.filter = "none";
      bodyContainer.style.pointerEvents = "auto";
    }
  });
}

//Function to handle delete mail
function deleteMail() {
  deleteButton.addEventListener("click", async function (e) {
    let id = e.currentTarget.getAttribute("id");
    removeMailDetails();
    removeItem(Number(id));
  });
}

// Function to handle mail restore
function restoreMail() {
  mailItemRestore.addEventListener("click", async function (e) {
    let id = e.currentTarget.getAttribute("id").split("_")[1];
    let mailitem = document.querySelector(`.mail-list-${id}`);
    mailitem.remove();
    removeMailDetails();
    let url = "http://localhost:3000/restoremail";
    let response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
    });
    await response.json();
  });
}

// Function to remove the maillist when deleting
async function removeItem(id) {
  let mailListItem = document.querySelector(`.mail-list-${id}`);
  let folder;
  if (mailListItem) {
    mailListItem.remove();
  }
  if (inbox.classList.contains("active")) {
    folder = "inbox";
  } else if (sent.classList.contains("active")) {
    folder = "sent";
  } else if (drafts.classList.contains("active")) {
    folder = "drafts";
  } else if (trash.classList.contains("active")) {
    folder = "trash";
  }

  if (folder === "inbox" || folder === "sent" || folder === "drafts") {
    const url = "http://localhost:3000/deletemail";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        folder: folder,
      }),
    });
    await response.json();
  } else {
    const url = "http://localhost:3000/forcedelete";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        folder: folder,
      }),
    });
    await response.json();
  }
}

// Function to update the unread notifications count
async function updateNotifications(id) {
  const url = "http://localhost:3000/readmail";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
    }),
  });
  await response.json();
  readNotifications();
}

async function readNotifications() {
  const url = "http://localhost:3000/readmail";
  const response = await fetch(url);
  const data = await response.json();
  notifications.textContent = data >= 0 ? data : 0;
  if (data === 0) {
    notifications.style.visibility = "hidden";
  } else {
    notifications.style.visibility = "visible";
  }
}

//Call functions to add eventlisteners
logoutUser();
handleFolderClick();
populateMailboxOnFolderClick();
handleNewMail();
deleteMail();
restoreMail();

//Load the inbox initially when page renders
fetchInbox();
