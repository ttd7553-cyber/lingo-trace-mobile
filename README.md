# LingoTrace Mobile

一个原创的手机端英语学习记录网页/PWA，灵感来自 LingoTrace 类应用的工作流：导入 ChatGPT 生成的学习日报 JSON，然后管理单词、句型、纠错与复习。

## 直接使用

打开 `index.html` 即可使用。所有数据保存在浏览器本地。

## 部署到 Vercel

1. 把这个文件夹上传到一个新的 GitHub 仓库。
2. 打开 https://vercel.com/，选择 `Add New Project`。
3. 导入刚才的 GitHub 仓库。
4. Framework Preset 选择 `Other`，Build Command 留空，Output Directory 留空。
5. 点击 `Deploy`。

部署完成后，Vercel 会给你一个 `https://...vercel.app` 网址，手机浏览器直接打开即可。

## 本地预览

```powershell
python -m http.server 4173
```

然后访问 `http://localhost:4173/lingo-trace-mobile/`。

## 支持的导入格式

推荐 JSON 顶层包含：

```json
{
  "schema": "LINGOTRACE_REPORT_V1",
  "date": "2026-08-23",
  "summary": "今天练习了商务英语表达。",
  "scores": { "fluency": 82, "accuracy": 76, "vocabulary": 88 },
  "words": [
    { "term": "handover", "meaning": "交接", "example": "Let's prepare the handover notes." }
  ],
  "sentences": [
    { "text": "Could you walk me through the timeline?", "translation": "你能带我过一下时间线吗？" }
  ],
  "corrections": [
    { "before": "I very like it.", "after": "I really like it.", "note": "very 不能直接修饰 like" }
  ]
}
```

也兼容常见字段别名，例如 `vocabulary`、`phrases`、`mistakes`、`items`。
