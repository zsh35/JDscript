const $ = new Env("京东分享码");
const notify = $.isNode() ? require("./sendNotify") : "";
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require("./jdCookie.js") : "";
const JD_API_HOST = "https://api.m.jd.com/client.action";
let cookiesArr = [],
    cookie = "";

if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item]);
    });
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === "false") console.log = () => {};
} else {
    let cookiesData = $.getdata("CookiesJD") || "[]";
    cookiesData = jsonParse(cookiesData);
    cookiesArr = cookiesData.map((item) => item.cookie);
    cookiesArr.reverse();
    cookiesArr.push(...[$.getdata("CookieJD2"), $.getdata("CookieJD")]);
    cookiesArr.reverse();
}

!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, "【提示】请先获取cookie\n直接使用NobyDa的京东签到获取", "https://bean.m.jd.com/", {
            "open-url": "https://bean.m.jd.com/",
        });
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.result = [];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
            $.index = i + 1;
            $.shareCode = {
                jdfactory: {
                    //日志中直接搜索下面内容即可快速找到互助码信息
                    //您的东东工厂好友助力邀请码：
                    name: "京东工厂",
                    base: "http://api.turinglabs.net/api/v1/jd/ddfactory/create/",
                    code: "",
                    err: "",
                },
                jxfactory: {
                    //日志中直接搜索下面内容即可快速找到互助码信息
                    //分享码:
                    name: "京喜工厂",
                    base: "http://api.turinglabs.net/api/v1/jd/jxfactory/create/",
                    code: "",
                    err: "",
                },
                pet: {
                    //日志中直接搜索下面内容即可快速找到互助码信息
                    //【您的东东萌宠互助码shareCode】
                    name: "京东萌宠",
                    base: "http://api.turinglabs.net/api/v1/jd/pet/create/",
                    code: "",
                },
                bean: {
                    //日志中直接搜索下面内容即可快速找到互助码信息
                    //【您的京东种豆得豆互助码】
                    name: "种豆得豆",
                    base: "http://api.turinglabs.net/api/v1/jd/bean/create/",
                    code: "", //此处放入互助码,支持数组或字符串类型
                    err: "",
                },
                farm: {
                    //日志中直接搜索下面内容即可快速找到互助码信息
                    //【您的东东农场互助码shareCode】
                    name: "京东农场",
                    base: "http://api.turinglabs.net/api/v1/jd/farm/create/",
                    code: "",
                    err: "",
                },
                crazyjoy: {
                    name: "疯狂的JOY",
                    base: "https://code.chiang.fun/api/v1/jd/jdcrazyjoy/create/",
                    code: "",
                    err: "",
                },
                jdzz: {
                    name: "京东赚赚",
                    base: "https://code.chiang.fun/api/v1/jd/jdzz/create/",
                    code: "",
                    err: "",
                },
            };
            await getShareCode(cookie);
            if (true) {
                await autoInject();
            }
            await msgShow();
        }
    }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done());

//#region 获取分享码
/**
 * 获取分享码
 * @param {String} cookie 京东cookie字符串
 */
async function getShareCode() {
    await shareCode_jdfactory();
    await shareCode_jxfactory();
    await shareCode_pet();
    await shareCode_bean();
    await shareCode_farm();
    await shareCode_crazyjoy();
    await shareCode_jdZZ();
}
async function shareCode_jdfactory() {
    var request = {
        url: `${JD_API_HOST}?functionId=jdfactory_getTaskDetail`,
        body: `functionId=jdfactory_getTaskDetail&body=${escape(JSON.stringify({}))}&client=wh5&clientVersion=9.1.0`,
        headers: {
            Cookie: cookie,
            origin: "https://h5.m.jd.com",
            referer: "https://h5.m.jd.com/",
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": $.isNode()
                ? process.env.JD_USER_AGENT
                    ? process.env.JD_USER_AGENT
                    : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"
                : $.getdata("JDUA")
                ? $.getdata("JDUA")
                : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0",
        },
    };
    return new Promise((resolve) => {
        $.post(request, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`$东东工厂 API请求失败，请检查网路重试`);
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.data.bizCode === 0) {
                            $.taskVos = data.data.result.taskVos; //任务列表
                            $.taskVos.map((item) => {
                                if (item.taskType === 14) {
                                    $.shareCode.jdfactory.code = item.assistTaskDetailVo.taskToken;
                                }
                            });
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
async function shareCode_jxfactory() {
    var request = {
        url: `https://m.jingxi.com/dreamfactory/userinfo/GetUserInfo?zone=dream_factory&pin=&sharePin=&shareType=&materialTuanPin=&materialTuanId=&sceneval=2&g_login_type=1&_time=${Date.now()}&_=${Date.now()}`,
        headers: {
            Cookie: cookie,
            Host: "m.jingxi.com",
            Accept: "*/*",
            Connection: "keep-alive",
            "User-Agent":
                "jdpingou;iPhone;3.14.4;14.0;ae75259f6ca8378672006fc41079cd8c90c53be8;network/wifi;model/iPhone10,2;appBuild/100351;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/62;pap/JA2015_311210;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
            "Accept-Language": "zh-cn",
            Referer: "https://wqsd.jd.com/pingou/dream_factory/index.html",
            "Accept-Encoding": "gzip, deflate, br",
        },
    };
    return new Promise((resolve) => {
        $.get(request, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`京喜工厂 API请求失败，请检查网路重试`);
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data["ret"] === 0) {
                            data = data["data"];
                            $.unActive = true; //标记是否开启了京喜活动或者选购了商品进行生产
                            $.encryptPin = "";
                            $.shelvesList = [];
                            if (data.factoryList && data.productionList) {
                                $.shareCode.jxfactory.code = data.user.encryptPin;
                            } else {
                                if (!data.factoryList) {
                                    $.shareCode.jxfactory.err = "活动未开启";
                                } else if (data.factoryList && !data.productionList) {
                                    $.shareCode.jxfactory.err = "未选购商品";
                                }
                            }
                        } else {
                            console.log(`jxfactory_GetUserInfo异常：${JSON.stringify(data)}`);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
async function shareCode_pet() {
    var request = {
        url: `${JD_API_HOST}?functionId=initPetTown`,
        body: `body=${escape(
            JSON.stringify({ version: 2, channel: "app" })
        )}&appid=wh5&loginWQBiz=pet-town&clientVersion=9.0.4`,
        headers: {
            Cookie: cookie,
            "User-Agent": $.isNode()
                ? process.env.JD_USER_AGENT
                    ? process.env.JD_USER_AGENT
                    : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"
                : $.getdata("JDUA")
                ? $.getdata("JDUA")
                : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0",
            Host: "api.m.jd.com",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    };
    return new Promise((resolve) => {
        $.post(request, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("\n东东萌宠: API查询请求失败 ‼️‼️");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    data = JSON.parse(data);

                    const initPetTownRes = data;

                    message = `【京东账号${$.index}】${$.UserName}\n`;
                    if (
                        initPetTownRes.code === "0" &&
                        initPetTownRes.resultCode === "0" &&
                        initPetTownRes.message === "success"
                    ) {
                        $.shareCode.pet.code = initPetTownRes.result.shareCode;
                    } else if (initPetTownRes.code === "0") {
                        console.log(`初始化萌宠失败:  ${initPetTownRes.message}`);
                    } else {
                        console.log("shit-pet");
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
async function shareCode_bean() {
    var request = {
        url: `${JD_API_HOST}`,
        body: `functionId=plantBeanIndex&body=${escape(
            JSON.stringify({ version: "9.0.0.1", monitor_source: "plant_app_plant_index", monitor_refer: "" })
        )}&appid=ld&client=apple&area=5_274_49707_49973&build=167283&clientVersion=9.1.0`,
        headers: {
            Cookie: cookie,
            Host: "api.m.jd.com",
            Accept: "*/*",
            Connection: "keep-alive",
            "User-Agent": $.isNode()
                ? process.env.JD_USER_AGENT
                    ? process.env.JD_USER_AGENT
                    : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"
                : $.getdata("JDUA")
                ? $.getdata("JDUA")
                : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0",
            "Accept-Language": "zh-Hans-CN;q=1,en-CN;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    };
    return new Promise(async (resolve) => {
        $.post(request, (err, resp, data) => {
            try {
                if (err) {
                    console.log("\n种豆得豆: API查询请求失败 ‼️‼️");
                    console.log(`function_id:${function_id}`);
                    $.logErr(err);
                } else {
                    data = JSON.parse(data);
                    if (data.code === "0") {
                        const shareUrl = data.data.jwordShareInfo.shareUrl;
                        $.shareCode.bean.code = getParam(shareUrl, "plantUuid");
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        });
    });
    function getParam(url, name) {
        const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        const r = url.match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
}
async function shareCode_farm() {
    var request = {
        url: `${JD_API_HOST}?functionId=initForFarm`,
        body: `body=${escape(JSON.stringify({ version: 4 }))}&appid=wh5&clientVersion=9.1.0`,
        headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            cookie: cookie,
            origin: "https://home.m.jd.com",
            pragma: "no-cache",
            referer: "https://home.m.jd.com/myJd/newhome.action",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "User-Agent": $.isNode()
                ? process.env.JD_USER_AGENT
                    ? process.env.JD_USER_AGENT
                    : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"
                : $.getdata("JDUA")
                ? $.getdata("JDUA")
                : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    };
    return new Promise((resolve) => {
        $.post(request, (err, resp, data) => {
            try {
                if (err) {
                    console.log("\n东东农场: API查询请求失败 ‼️‼️");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        var jsonData = JSON.parse(data);
                        if (jsonData && jsonData.farmUserPro) {
                            $.shareCode.farm.code = jsonData.farmUserPro.shareCode;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
async function shareCode_crazyjoy() {
    let t = Date.now().toString().substr(0, 10);
    let e = $.md5("aDvScBv$gGQvrXfva8dG!ZC@DA70Y%lX" + t) + Number(t).toString(16);
    var request = {
        url: `https://api.m.jd.com/?uts=${e}&appid=crazy_joy&functionId=crazyJoy_user_gameState&body=${escape({
            paramData: "",
        })}&t=${t}`,
        headers: {
            Cookie: cookie,
            Host: "api.m.jd.com",
            Accept: "*/*",
            Connection: "keep-alive",
            "User-Agent": $.isNode()
                ? process.env.JD_USER_AGENT
                    ? process.env.JD_USER_AGENT
                    : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"
                : $.getdata("JDUA")
                ? $.getdata("JDUA")
                : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0",
            "Accept-Language": "zh-cn",
            Referer: "https://crazy-joy.jd.com/",
            origin: "https://crazy-joy.jd.com",
            "Accept-Encoding": "gzip, deflate, br",
        },
    };
    return new Promise((resolve) => {
        $.get(request, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.success && data.data && data.data.userInviteCode) {
                            $.shareCode.crazyjoy.code = data.data.userInviteCode;
                        } else console.log(`用户信息获取失败`);
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
async function shareCode_jdZZ() {
    var request = {
        url: `${JD_API_HOST}?functionId=interactIndex&body=${escape(
            JSON.stringify({})
        )}&client=wh5&clientVersion=9.1.0`,
        headers: {
            Cookie: cookie,
            Host: "api.m.jd.com",
            Connection: "keep-alive",
            "Content-Type": "application/json",
            Referer: "http://wq.jd.com/wxapp/pages/hd-interaction/index/index",
            "User-Agent": $.isNode()
                ? process.env.JD_USER_AGENT
                    ? process.env.JD_USER_AGENT
                    : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"
                : $.getdata("JDUA")
                ? $.getdata("JDUA")
                : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0",
            "Accept-Language": "zh-cn",
            "Accept-Encoding": "gzip, deflate, br",
        },
    };
    return new Promise((resolve) => {
        $.get(request, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.data.shareTaskRes) {
                            $.shareCode.jdzz.code = data.data.shareTaskRes.itemId;
                        } else {
                            $.shareCode.jdzz.err = `已满5人助力,暂时看不到您的京东赚赚好友助力码`;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
//#endregion

//#region 自动注入互助码
async function autoInject() {
    var keys = Object.keys($.shareCode);
    for (var index in keys) {
        var request = $.shareCode[keys[index]];
        if (request.base && request.code) {
            await httpRequest(request);
        } else {
            $.result.push(
                `【${request.name}】⛔️\n${
                    request.code ? request.code : request.err ? request.err : "未配置提交链接或未获取到互助码"
                }`
            );
        }
    }
}
function httpRequest(info) {
    return new Promise((resolve) => {
        $.get({ url: `${info.base}${info.code.trim()}/` }, (err, resp, data) => {
            try {
                const obj = JSON.parse(data);
                if (obj.code == 200) {
                    $.result.push(`【${info.name}】✅\n${info.code}`);
                } else if (obj.code == 400) {
                    $.result.push(`【${info.name}】✔️\n${info.code}`);
                } else {
                    $.result.push(`【${info.name}】❌\n${info.code}`);
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
//#endregion

/** 检测是否可以成功转换成json对象 */
function safeGet(data) {
    try {
        if (typeof JSON.parse(data) == "object") {
            return true;
        }
    } catch (e) {
        console.log(e);
        console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
        return false;
    }
}

/** 最终的通知消息 */
function msgShow() {
    return new Promise(async (resolve) => {
        var shareCodeMsg = "\n";
        if ($.result.length > 0) {
            for (var index in $.result) {
                shareCodeMsg += `\n${$.result[index]}`;
            }
        } else {
            shareCodeMsg += `\n【京东工厂】\n${
                $.shareCode.jdfactory.code ? $.shareCode.jdfactory.code : $.shareCode.jdfactory.err
            }`;
            shareCodeMsg += `\n【京喜工厂】\n${
                $.shareCode.jxfactory.code ? $.shareCode.jxfactory.code : $.shareCode.jxfactory.err
            }`;
            shareCodeMsg += `\n【京东萌宠】\n${$.shareCode.pet.code ? $.shareCode.pet.code : $.shareCode.pet.err}`;
            shareCodeMsg += `\n【种豆得豆】\n${$.shareCode.bean.code ? $.shareCode.bean.code : $.shareCode.bean.err}`;
            shareCodeMsg += `\n【京东农场】\n${$.shareCode.farm.code ? $.shareCode.farm.code : $.shareCode.farm.err}`;
            shareCodeMsg += `\n【疯狂JOY】\n${
                $.shareCode.crazyjoy.code ? $.shareCode.crazyjoy.code : $.shareCode.crazyjoy.err
            }`;
            shareCodeMsg += `\n【京东赚赚】\n${$.shareCode.jdzz.code ? $.shareCode.jdzz.code : $.shareCode.jdzz.err}`;
        }

        $.msg($.name, ``, `【京东账号${$.index}】${$.UserName}${shareCodeMsg}`);
        if ($.isNode()) {
            await notify.sendNotify(
                `${$.name} - 账号${$.index} - ${$.UserName}`,
                `【京东账号${$.index}】${$.UserName}${shareCodeMsg}`
            );
        }
        resolve();
    });
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
// prettier-ignore
!function(n){function t(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var e,i,a,d,h,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16){i=l,a=g,d=v,h=m,g=f(g=f(g=f(g=f(g=c(g=c(g=c(g=c(g=u(g=u(g=u(g=u(g=o(g=o(g=o(g=o(g,v=o(v,m=o(m,l=o(l,g,v,m,n[e],7,-680876936),g,v,n[e+1],12,-389564586),l,g,n[e+2],17,606105819),m,l,n[e+3],22,-1044525330),v=o(v,m=o(m,l=o(l,g,v,m,n[e+4],7,-176418897),g,v,n[e+5],12,1200080426),l,g,n[e+6],17,-1473231341),m,l,n[e+7],22,-45705983),v=o(v,m=o(m,l=o(l,g,v,m,n[e+8],7,1770035416),g,v,n[e+9],12,-1958414417),l,g,n[e+10],17,-42063),m,l,n[e+11],22,-1990404162),v=o(v,m=o(m,l=o(l,g,v,m,n[e+12],7,1804603682),g,v,n[e+13],12,-40341101),l,g,n[e+14],17,-1502002290),m,l,n[e+15],22,1236535329),v=u(v,m=u(m,l=u(l,g,v,m,n[e+1],5,-165796510),g,v,n[e+6],9,-1069501632),l,g,n[e+11],14,643717713),m,l,n[e],20,-373897302),v=u(v,m=u(m,l=u(l,g,v,m,n[e+5],5,-701558691),g,v,n[e+10],9,38016083),l,g,n[e+15],14,-660478335),m,l,n[e+4],20,-405537848),v=u(v,m=u(m,l=u(l,g,v,m,n[e+9],5,568446438),g,v,n[e+14],9,-1019803690),l,g,n[e+3],14,-187363961),m,l,n[e+8],20,1163531501),v=u(v,m=u(m,l=u(l,g,v,m,n[e+13],5,-1444681467),g,v,n[e+2],9,-51403784),l,g,n[e+7],14,1735328473),m,l,n[e+12],20,-1926607734),v=c(v,m=c(m,l=c(l,g,v,m,n[e+5],4,-378558),g,v,n[e+8],11,-2022574463),l,g,n[e+11],16,1839030562),m,l,n[e+14],23,-35309556),v=c(v,m=c(m,l=c(l,g,v,m,n[e+1],4,-1530992060),g,v,n[e+4],11,1272893353),l,g,n[e+7],16,-155497632),m,l,n[e+10],23,-1094730640),v=c(v,m=c(m,l=c(l,g,v,m,n[e+13],4,681279174),g,v,n[e],11,-358537222),l,g,n[e+3],16,-722521979),m,l,n[e+6],23,76029189),v=c(v,m=c(m,l=c(l,g,v,m,n[e+9],4,-640364487),g,v,n[e+12],11,-421815835),l,g,n[e+15],16,530742520),m,l,n[e+2],23,-995338651),v=f(v,m=f(m,l=f(l,g,v,m,n[e],6,-198630844),g,v,n[e+7],10,1126891415),l,g,n[e+14],15,-1416354905),m,l,n[e+5],21,-57434055),v=f(v,m=f(m,l=f(l,g,v,m,n[e+12],6,1700485571),g,v,n[e+3],10,-1894986606),l,g,n[e+10],15,-1051523),m,l,n[e+1],21,-2054922799),v=f(v,m=f(m,l=f(l,g,v,m,n[e+8],6,1873313359),g,v,n[e+15],10,-30611744),l,g,n[e+6],15,-1560198380),m,l,n[e+13],21,1309151649),v=f(v,m=f(m,l=f(l,g,v,m,n[e+4],6,-145523070),g,v,n[e+11],10,-1120210379),l,g,n[e+2],15,718787259),m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,d),m=t(m,h)}return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8){r+=String.fromCharCode(n[t>>5]>>>t%32&255)}return r}function d(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1){r[t]=0}var e=8*n.length;for(t=0;t<e;t+=8){r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32}return r}function h(n){return a(i(d(n),8*n.length))}function l(n,t){var r,e,o=d(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1){u[r]=909522486^o[r],c[r]=1549556828^o[r]}return e=i(u.concat(d(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="";for(r=0;r<n.length;r+=1){t=n.charCodeAt(r),e+="0123456789abcdef".charAt(t>>>4&15)+"0123456789abcdef".charAt(15&t)}return e}function v(n){return unescape(encodeURIComponent(n))}function m(n){return h(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}$.md5=A}(this);
