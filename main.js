let dataBeforeDays = [];
const currentValute = { _value: "" };
Object.defineProperties(currentValute, {
    value: {
        get() {
            return this._value;
        },
        set(v) {
            this._value = v;
            //обновляем содержимое всех .current-valute
            const currents = document.querySelectorAll(".current-valute");
            if (currents.length) currents.forEach(e => (e.textContent = v));
        },
    },
    _value: {
        configurable: false,
        enumerable: false,
        writable: false,
    },
});

async function fetchBeforeDays(arrUrls) {
    let res = [];
    for (let url of arrUrls) {
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
        removeRemovable();
    }
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

function CBR_XML_Daily_Ru(rates) {
    setTitleTime();
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
