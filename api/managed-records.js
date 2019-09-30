import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records?limit=11";

let primaryColors = ["red", "blue", "yellow"];

// Your retrieve function plus any additional functions go here ...
function retrieve(param) {
    param = param || {};

    let page = param.page || 1;
    //creating the URI
    let uri = new URI(window.path).addQuery("offset", (page - 1) * 10)
    if (param.colors != null) {
        uri.addQuery("color[]", param.colors)
    }

//calling the URI using fetch
    return fetch(uri)
        .then(res => {
            if (res.ok) {
                return res.json()
            } else {
                throw new Error("Error in fetch:", res.status)
            }
        })
        .then(res => {
            //buiding the finalData by creating functions needed for the data conversion
            let finalData;
            let topTen = getTopTen(res);
            let isLastPage = checkIfLast(res);
            let idList = getIdList(topTen);
            let openDispositions = getOpenDisposition(topTen);
            let closedDespositionsPrimaryLength = getClosedDisposition(topTen);
            let previousPage = page == null || page == 1 ? null : page - 1;
            let nextPage = page == null ? 2 : page + 1;
            if (isLastPage) {
                nextPage = null;
            }
            //final product
            finalData = {
                previousPage: previousPage,
                nextPage: nextPage,
                ids: idList,
                open: openDispositions,
                closedPrimaryCount: closedDespositionsPrimaryLength,
            }
            return finalData;
        })
        .catch(err => {
            console.log('this is the err:', err);
        })
}

let getTopTen = (records) => {
    return records.slice(0, 10);
}

let checkIfLast = (records) => {
    if (records.length < 11) {
        return true;
    }
    return false;
}

let getIdList = (records) => {
    return records.map(element => {
        return element.id;
    });
}

let getOpenDisposition = (records) => {
    let openList = [];
    openList = records.filter(record => {
        return record.disposition == "open";
    })

    openList = openList.map(element => {
        let tempObj = {};
        let primaryColor = checkIfPrimary(element);
        tempObj = { ...element, isPrimary: primaryColor };
        return tempObj;
    })
    return openList;
}

let getClosedDisposition = (records) => {
    let closedAndPrimary = records.filter(record => {
        return record.disposition == "closed" && checkIfPrimary(record);
    })
    return closedAndPrimary.length;
}

let checkIfPrimary = (record) => {
    if (primaryColors.includes(record.color)) {
        return true;
    } else {
        return false;
    }
}

export default retrieve;
