async function fetchBeforeTenDays(arrUrls) {
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
        }
    }
    return res;
}

function beforeTenDaysUrlArray(volume, prefix, postfix) {
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
function itemRow(val) {
    const element = document.createElement("li");
    element.classList.add("item");
    Object.entries(val).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    element.innerHTML = `
        <div class='row'>
            <div class="valute-name">${val.CharCode}</div>
            <div class="valute-name">${val.Value}</div>
            <div class="valute-name">${(
                (+val.Value / +val.Previous) *
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
        const history = document.createElement("div");
        history.classList.add("history");
        li.append(history);
        container.append(li);
    });
    container.addEventListener("click", ({ target }) => {
        const item = target.closest(".item");
        const history = item.querySelector(".history");
        history.classList.toggle("show");
    });

    const arrUrls = beforeTenDaysUrlArray(
        10,
        "https://www.cbr-xml-daily.ru/archive/",
        "/daily_json.js",
    );
    fetchBeforeTenDays(arrUrls).then(console.log);
}
