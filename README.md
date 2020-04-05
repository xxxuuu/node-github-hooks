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
          "shell": "./run.sh"
        }
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

3. 开发环境使用 `npm run server` 运行

4. 生产环境使用 `npm run pro` 运行（需先安装pm2：`npm install -g pm2`）

5. 在 Github 仓库 -> Settings -> Webhooks 中 Add webhook 并配置

