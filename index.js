let http = require('http');
let querystring = require('querystring');
let config = require('./config');
let exec = require('child_process').exec;
let crypto = require('crypto');
let fs = require('fs');

// 默认clone路径
let gitClonePath = './';
// 默认端口
let listenPort = 80;

/**
 * 初始化配置
 */
let initConfig = function() {
    gitClonePath = config['clone_path'] || gitClonePath;
    listenPort = config['listen_port'] || listenPort;
};

/**
 * SHA1加密
 * @param str 待加密字符串
 * @param token 密钥
 * @return {string} 加密后字符串
 */
let sha1 = function(str, token) {
    return crypto.createHmac('sha1', token).update(str).digest('hex');
};

/**
 * 执行命令并默认输出
 * @param command 执行的命令
 */
let simpleExec = function(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log(stderr);
            } else {
                console.log(stdout);
            }
            resolve();
        });
    });
};

/**
 * 拉取远程仓库
 * @param clonePath 本地clone地址
 * @param cloneUrl 远程仓库clone url
 * @param repoName 仓库名
 * @param branch 远程仓库分支
 */
let cloneRepo = async function(clonePath, cloneUrl, repoName, branch) {
    let repoPath = clonePath + '/' + repoName;
    let pullCommand = 'cd ' + repoPath + ' && git pull origin ' + branch + ':master';
    // 存在就pull，不存在clone
    try {
        fs.statSync(repoPath + '/.git/').isDirectory()
    } catch (e) {
        await simpleExec('git clone -b ' + branch + ' ' + cloneUrl + ' ' + repoPath);
        return;
    }
    await simpleExec(pullCommand);
};


initConfig();
http.createServer((req, res) => {
    if(req.method !== 'POST') {
        res.end();
    }

    let dataList = [];

    req.on('data', buffer => {
        dataList.push(buffer);
    });
    req.on('end', () => {
        // 接收到的数据二进制流
        let data = Buffer.concat(dataList).toString();
        // payload数据
        let payload = JSON.parse(querystring.parse(data)['payload']);
        // 仓库名和clone地址
        let repoName = payload['repository']['name'];
        let cloneUrl = payload['repository']['clone_url'];
        // 密钥
        let secret = req.headers['x-hub-signature'];

        // 校验密钥
        if(secret !== ('sha1='+ sha1(data, config['secret_token']))) {
            res.end();
        }

        // 配置中没有这个仓库
        if(!config.repo[repoName]) {
            res.end();
        }

        (async () => {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            console.log('[%s] %s正在部署...', new Date().toLocaleString(), repoName);

            // 拉取
            console.log('[%s] 拉取项目中...', new Date().toLocaleString());
            await cloneRepo(gitClonePath, cloneUrl, repoName, config.repo[repoName]['branch']);
            console.log('[%s] 拉取完毕', new Date().toLocaleString());

            // 执行shell
            if(config.repo[repoName]['shell']) {
                console.log('[%s] 执行shell %s中...', new Date().toLocaleString(), config.repo[repoName]['shell']);
                await simpleExec('sh ' + config.repo[repoName]['shell']);
                console.log('[%s] 执行shell 完毕', new Date().toLocaleString());
            }

            console.log('[%s] 仓库%s部署完毕:)', new Date().toLocaleString(), repoName);
            console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
        })();
    });
    res.end();
}).listen(listenPort);

