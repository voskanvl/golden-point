function removeRemovable() {
    const items = document.querySelectorAll(".header");
    items.forEach(item => {
        const toRemove = item.querySelector(".to-remove");
        toRemove.remove();
    });
}
function initTooltip(selector, root, item) {
    const container = document.querySelector(root);
    const tooltip = document.querySelector(selector);
    container.addEventListener("mouseover", event => {
        const li = event.target.closest(item);

        const name = li?.getAttribute("name");
        if (li && name) {
            currentValute.value = name;
            tooltip.style.opacity = "1";
            tooltip.style.top = `${event.pageY + 5}px`;
            tooltip.style.left = `${event.pageX + 5}px`;
        }
    });
    container.addEventListener("mouseout", event => {
        tooltip.style.opacity = "0";
    });
}
function setTitleTime() {
    //указываем текущцю дату в футере
    const nowTitle = document.querySelector("#now");
    nowTitle.innerHTML = new Date(Date.now()).toLocaleDateString();
}
function renderItems(rates) {
    return Object.keys(rates.Valute).map(val => {
        const li = itemRow(rates.Valute[val]);
        const history = document.createElement("ul");
        history.classList.add("history");
        const head = document.createElement("li");
        head.classList.add("item", "header");
        head.innerHTML = `
            <div class="row">
                <div>Дата</div>
                <div>Валюта</div>
                <div>Курс</div>
                <div>Изменения</div>
            </div>
            <div class="row to-remove">Данные загружаются ... </div>
        `;
        head.style.position = "fix";
        history.append(head);
        li.append(history);
        return li;
    });
}
function itemRow(valute) {
    const element = document.createElement("li");
    element.classList.add("item");
    element.setAttribute("charcode", valute.CharCode);
    element.setAttribute("name", valute.Name);
    element.innerHTML = `
        <div class='row'>
            <div class="valute-code">${valute.CharCode}</div>
            <div class="valute-value">${valute.Value}</div>
            <div class="valute-percent">${(
                (+valute.Value / +valute.Previous) *
                100
            ).toFixed(1)}% <span class="${
        +valute.Value / +valute.Previous > 1 ? "up" : "down"
    }">${
        +valute.Value / +valute.Previous > 1 ? "&#9650;" : "&#9660;"
    }</span></div>
        </div>
    `;
    return element;
}
