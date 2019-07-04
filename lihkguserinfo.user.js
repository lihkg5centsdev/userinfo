// ==UserScript==
// @name         LIHKG User Info
// @namespace    https://github.com/lihkg5centsdev/userinfo
// @version      1.4
// @description  LIHKG Show User Info (Registration Date, User Tag etc.)
// @author       LIHKG 5Cents Dev
// @match        https://lihkg.com/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/xhook/1.4.9/xhook.min.js
// @require      https://code.jquery.com/jquery-2.1.4.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/js/all.min.js
// @run-at       document-start
// ==/UserScript==

// 0.5 list
let filter = {}

const userType = [{
    title: '五毛',
    code: '<i class="fab fa-alipay" style="color: #FFD700"></i>'
},
{
    title: '假膠',
    code: '<img alt=":o)" src="https://lihkg.com/assets/faces/normal/clown.gif">'
},
{
    title: '分化',
    code: '<img src="https://lihkg.com/assets/faces/normal/dead.gif">'
}]


setInterval(getFilter, 600000) // update user filter list every 10 minutes
getFilter()

function getFilter() {
    fetch("https://raw.githubusercontent.com/lihkg5centsdev/userinfo/master/lihkguserlist.json?_=" + new Date().getTime(), {
        method: 'GET',
        credentials: "omit"
    }).then(response => {
        return response.json();
    }).then(result => {
        filter = result
        console.log('5cents filter updated. Total: ' + Object.keys(result).length)
    }).catch(function () {
        console.log('5cents filter update failed!!!')
    });
}


xhook.after(function (request, response) {
    if (request.url.match(/https:\/\/lihkg.com\/api_v2\/thread\/(\d+\/page|category|latest)/)) {
        let resp = JSON.parse(response.text)
        let items = resp.response.item_data || resp.response.items
        for (let i = 0; i < items.length; i++) {
            let tag = '<b style=\'color:#aaaaaa\'>'
            if (filter[items[i].user.user_id]) {
                let user = userType[filter[items[i].user.user_id].type];
                console.log(user);
                items[i].user_nickname = `<span data-tip="${user.title}">${user.code} • ${items[i].user_nickname}</span>`
            }
            if (items[i].user.create_time >= 1560009600) {
                if (request.url.match(/https:\/\/lihkg.com\/api_v2\/thread\/(\d+)/)) {
                    tag += ` • 註冊日期: ${new Date(items[i].user.create_time * 1000).toLocaleDateString("en-US")}`
                } else {
                    tag += ` • <i class="fas fa-parking" style="color: grey"></i>`
                }
            }
            items[i].user_nickname += tag + '</b>'
        }
        response.text = JSON.stringify(resp)
    }
})
