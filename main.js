let dataBeforeDays = [];
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
async function fetchBeforeDays(arrUrls) {
    let res = [];
    for (let url of arrUrls) {
        try {
            let r = await fetch(url, {
                // mode: "no-cors",
            });
            console.log("🚀 ~ r", r, url);
            if (r.ok) {
                r = await r.json();
                res.push(r);
            }
        } catch (error) {
            console.log("🚀 ~ error", error);
            res.push({ url, error });
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
function itemRow(valute) {
    const element = document.createElement("li");
    element.classList.add("item");
    Object.entries(valute).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
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
function initTooltip() {
    const tooltip = document.querySelector("#tooltip");
    container.addEventListener("mouseover", event => {
        const li = event.target.closest("li");
        if (li) {
            tooltip.textContent = li.getAttribute("name");
            tooltip.style.opacity = "1";
            tooltip.style.top = `${event.pageY}px`;
            tooltip.style.left = `${event.pageX}px`;
        }
    });
    container.addEventListener("mouseout", event => {
        tooltip.style.opacity = "0";
    });
}
function CBR_XML_Daily_Ru(rates) {
    const container = document.querySelector("#container");
    initTooltip();
    Object.keys(rates.Valute).forEach(val => {
        const li = itemRow(rates.Valute[val]);
        const history = document.createElement("ul");
        history.classList.add("history");
        li.append(history);
        container.append(li);
    });
    container.addEventListener("click", async ({ target }) => {
        const item = target.closest(".item");
        const history = item.querySelector(".history");
        const charcode = item.getAttribute("charcode");
        history.classList.toggle("show");
        await initDataBeforeDays();
        const obj = dataBeforeDays.map(e => {
            if ("error" in e) {
                const el = document.createElement("li");
                el.classList.add("item");
                el.innerHTML = `<div class="row">В этот день курсы не определены</div>`;
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
        console.log("🚀 ~ obj", obj);
        history.append(...obj);
    });
}
