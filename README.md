# node-github-hooks

使用 Node.js 实现的简易 Github Webhooks 服务端



## 使用方法

1. clone 本项目

2. 修改配置文件 `config.json`：

    ```JSON
    {
      "clone_path": "repos",
      "listen_port": 80,
      "secret_token": "token",
      "repo": {
        "xxxuuu.github.io": {
          "branch": "master",
          "shell": "./run.sh",
          "recipient": "example@qq.com"
        }
      },
      "smtp": {
        "host": "smtp.qq.com",
        "port": 587,
        "email": "example@qq.com",
        "user": "",
        "pass": ""
      }
    }
    
    ```

    说明：

    - `clone_path`：clone 到的本地地址，默认值为 `repos`，则项目 a 会 clone 到运行目录下的 `repos/a`
    - `listen_port`：服务端监听端口
    - `secret_token`：加密密钥，为保证安全、务必设置且不要泄露
    - `repo`：仓库，只有在这配置过的仓库才会作响应，没有配置的仓库就算接收到 hook 也不作处理
        - repo 下为 `仓库名:配置`
        - `branch`：从该仓库拉取的分支
        - `shell`：拉取完后执行的 shell，可空
        - `recipient`：启用邮件提醒时该仓库的收件人，可空
    - `smtp`: 部署完成后邮件提醒功能的配置，如不需要此功能请删除整个 `stmp` 块
        - `host`: 发送邮件服务器
        - `port`: 发送端口
        - `email`: 邮箱地址
        - `user`: 邮箱账号
        - `pass`: 邮箱密码

3. 使用 `npm install` 安装依赖

4. 开发环境使用 `npm run server` 运行

5. 生产环境使用 `npm run pro` 运行（需先安装pm2：`npm install -g pm2`）

6. 在 Github 仓库 -> Settings -> Webhooks 中 Add webhook 并配置

