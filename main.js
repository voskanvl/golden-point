let dataBeforeDays = [];

async function fetchBeforeDays(arrUrls) {
    let res = [];
    for (let url of arrUrls) {
        console.log(url.match(/(\d+)/g).reverse().join("."));
        try {
            let r = await fetch(url);
            if (r.ok) {
                r = await r.json();
                res.push(r);
            }
        } catch (error) {
            console.log("🚀 ~ error", error);
            res.push({
                Date: url.match(/(\d+)/g).reverse().join("."),
                url,
                error,
            });
        }
    }
    return res;
}

function beforeDaysUrlArray(volume, prefix, postfix) {
    const date = new Date(Date.now());
    const day = date.getDate();
    const res = [];
    for (let index = 1; index < volume; index++) {
        date.setDate(day - index);
        let str = date.toLocaleDateString().split(".").reverse().join("/");
        str = prefix + str + postfix;
        res.push(str);
    }
    return res;
}

async function initDataBeforeDays() {
    if (!dataBeforeDays.length) {
        const arrUrls = beforeDaysUrlArray(
            11,
            "https://www.cbr-xml-daily.ru/archive/",
            "/daily_json.js",
        );
        const res = await fetchBeforeDays(arrUrls);
        dataBeforeDays = res;
    }
}

function itemRow(valute) {
    const element = document.createElement("li");
    element.classList.add("item");
    // Object.entries(valute).forEach(([key, value]) => {
    //     element.setAttribute(key, value);
    // });
    element.setAttribute("charcode", valute.CharCode);
    element.setAttribute("name", valute.Name);
    element.innerHTML = `
        <div class='row'>
            <div class="valute-code">${valute.CharCode}</div>
            <div class="valute-value">${valute.Value}</div>
            <div class="valute-percent">${(
                (+valute.Value / +valute.Previous) *
                100
            ).toFixed(1)}%</div>
        </div>
    `;
    return element;
}
function initTooltip(selector, root, item) {
    const container = document.querySelector(root);
    const tooltip = document.querySelector(selector);
    container.addEventListener("mouseover", event => {
        const li = event.target.closest(item);

        const name = li?.getAttribute("name");
        if (li && name) {
            tooltip.textContent = name;
            tooltip.style.opacity = "1";
            tooltip.style.top = `${event.pageY}px`;
            tooltip.style.left = `${event.pageX}px`;
        }
    });
    container.addEventListener("mouseout", event => {
        tooltip.style.opacity = "0";
    });
}
function listDataBeforeDays(charcode) {
    return dataBeforeDays.map(e => {
        if ("error" in e) {
            const el = document.createElement("li");
            el.classList.add("item");
            el.innerHTML = `<div class="row red"><span>${e.Date}</span> Курс ЦБ РФ на данную дату не установлен. <a href="https://www.cbr.ru/currency_base/daily/">Проверить</a>`;
            return el;
        }
        const li = itemRow(e.Valute[charcode]);
        const row = li.querySelector(".row");
        const date = document.createElement("div");
        const dataObject = new Date(e.Date);
        date.innerHTML = `<div class="date">${dataObject.toLocaleDateString()}</div>`;
        row.prepend(date);
        return li;
    });
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
        `;
        head.style.position = "fix";
        history.append(head);
        li.append(history);
        return li;
    });
}
function CBR_XML_Daily_Ru(rates) {
    const container = document.querySelector("#container");
    initTooltip("#tooltip", "#container", "li");
    container.append(...renderItems(rates));
    container.addEventListener("click", async ({ target }) => {
        const item = target.closest(".item");
        //получаем код валюты по клику
        const charcode = item.getAttribute("charcode");
        //открываем аккордион history
        const history = item.querySelector(".history");
        history.classList.toggle("show");
        //полужаем данные о предыдущих 10 днях в dataBeforeDays
        //если они там уже есть то обращения к серверу не просиходит
        await initDataBeforeDays();
        //получаем список элементов с данными о предыдущих 10 днях
        const obj = listDataBeforeDays(charcode);
        //вставлем в аккордион
        history.append(...obj);
    });
}
