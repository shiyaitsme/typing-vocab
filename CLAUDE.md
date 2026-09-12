# CLAUDE.md

给在这个仓库里干活的 AI agent 看的操作手册。**功能说明、界面细节、部署步骤在
`README.md` 里，这里不重复**——这份只写"动手前必须知道的约束"。

## 这个项目长什么样

一个打字背单词的 Web App，部署在 Cloudflare Pages + D1。

- **`index.html` 是整个前端**——HTML、CSS、JS 全在这一个文件里（3000+ 行），
  纯 vanilla JS，没有框架、没有打包工具、**没有构建步骤**。
- `functions/api/**` 是 Cloudflare Pages Functions（后端），每个文件导出
  `onRequestGet`/`onRequestPost`/`onRequestPatch`/`onRequestDelete`。
- `design-system/` 是给 claude.ai/design 用的 React 组件包，**不参与生产构建，
  `index.html` 不引用它**。改 UI 时不要以为改了这里页面就会变。

**部署 = 推到 `main`。** Cloudflare 已经接了 GitHub 自动部署，push 完等一两分钟
就上线了，不需要跑任何部署命令。

## 硬性约束（违反了会出事）

### 1. 单词的写操作永远按 `id` 单行走

绝不要写"整表删掉再重新插入"这种逻辑。历史上就是因为这样写，导致"切单词本/
点历史记录后收藏和笔记丢失"。现在每个单词对象都带数据库主键 `id`，所有写操作
都是 `PATCH /api/words/:id` / `DELETE /api/words/:id` 这种单行操作。加新字段时
沿用这个模式，别图省事做批量覆盖。

### 2. 图片字节不许进 `words.notes`

`GET /api/words` 会一次返回一个账号一个语言模式下的**所有**单词连同 `notes`。
任何内联进 `notes` 的二进制/base64 都会让打开单词本的体积线性膨胀。图片存
`word_images` 表，`notes` 里只留 `<img data-img-id="N">`。
`sanitizeNoteHtml()` 负责在存盘前剥掉 `src`，`hydrateNoteImages()` 负责在渲染时
装回去——改笔记相关代码时不要绕过这两个函数。详见 README"笔记图片为什么单独存
一张表"。

### 3. 改数据库结构要同时改两个地方

- `schema.sql`：**全新数据库**的完整定义，只用 `CREATE TABLE IF NOT EXISTS` /
  `CREATE INDEX IF NOT EXISTS`，随便重跑。
- `migrations/00N_xxx.sql`：给**已经部署的旧库**用的一次性升级脚本。

两个都要写。而且注意 SQLite/D1 的坑：

- **`ALTER TABLE ... ADD COLUMN` 不支持 `IF NOT EXISTS`**（只有 `CREATE TABLE`/
  `CREATE INDEX` 有）。重跑会报 duplicate column，属正常。
- **`wrangler d1 execute --file=` 把整个文件当一个事务**：文件里只要有一条语句
  失败，整个文件回滚。所以千万不要把"已经跑过的迁移"和"新迁移"混在一个文件里。
- 每个迁移文件都要能独立执行，不依赖别的迁移跑没跑过。

**迁移不会自动执行。** 代码推上去了但迁移没跑，线上就是 500。写完迁移必须告诉
用户去 Cloudflare Dashboard → D1 → `typing-vocab-db` → Console 粘贴执行，或者
用 `npx wrangler d1 execute typing-vocab-db --remote --file=./migrations/xxx.sql`
（用户本机没装 wrangler，默认推荐 Dashboard 那条路）。

### 4. 云端连不上时必须优雅降级

`cloudOk === false`（云端请求失败）或 `id < 0`（本地临时数据，还没写进 D1）时，
所有写操作要**直接跳过、不发请求**，绝不能拿前端的默认词表去覆盖云端真实数据。
新加的写操作都要带上这个判断，参考 `patchWordRemote()` / `deleteWordRemote()`。

## 代码约定

- **样式**：绝大多数是元素上的 inline `style`，少数需要伪类/滚动条的写在文件
  顶部的 `<style>` 里。跟着周围的写法走，不要引入 CSS 文件或 class 体系。
- **文案**：所有用户可见文字走 i18n。字典是 `index.html` 里的两大块对象
  （韩语 `ko` / 英语 `en`），**两边都要加**。运行时用 `t('key')`，静态 HTML 用
  `data-i18n` / `data-i18n-title` / `data-i18n-placeholder` 属性。界面语言和
  练习语言（ko/en 词表）是两回事，别搞混。
- **注释**：写"为什么"而不是"做了什么"。这个仓库里现有的注释密度偏高、都在解释
  踩过的坑和设计取舍，跟着这个风格写。
- **后端**：每个 handler 自己解析 `?user=` 和 `?mode=`，自己校验，自己返回
  `Bad Request`。没有中间件，别去造一个。所有查询都必须带 `user_id` 条件——
  这是唯一的数据隔离手段。

## 怎么验证改动

仓库里**没有测试套件**，也没有 lint 配置。改完至少做到：

- `node --check` 过一遍改动过的 `functions/api/**.js`。
- 前端改动可以把 `index.html` 里的 `<script>` 抽出来 `node --check`。

要真正端到端验证（推荐给有数据库改动的功能），可以在临时目录里搭一套：用
`node:sqlite`（Node 22 内置）按 `schema.sql` 建一个内存库，写一个几十行的 D1 shim
（`prepare().bind().first()/run()/all()` + `batch()`），用 `await import()` 直接加载
`functions/api/**` 里的真实 handler，套一个 `http.createServer` 同时把 `index.html`
当静态文件发出去，然后用全局装好的 Playwright（`/opt/node22/lib/node_modules/playwright`，
Chromium 在 `/opt/pw-browsers`）驱动真实浏览器跑流程。这样前后端跑的都是真代码，
比 mock 靠谱得多。注意 D1 的 `batch()` 返回的是 `{results: [...]}` 形状，shim 要对齐，
不然 `functions/api/words/bulk.js` 会挂。

## 别碰的东西

- **韩语组字引擎（`makeKoreanEngine`）**：自己实现的 두벌식 状态机，刻意不走浏览器
  IME。改之前先读 README 第一节，理解为什么不用 `compositionstart`。
- **`history_batches` 表**：已废弃，代码不再读写。留着是为了不销毁老数据，别删也
  别加新用途。
- **`overflow-anchor: none` 和 viewport meta 里的 `interactive-widget=resizes-content`**：
  修手机端"打字时页面自己往上跳"的，看着像没用的样板代码，删了就复发。
