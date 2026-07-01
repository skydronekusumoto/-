# 映像制作 営業用スライド

企業向け映像制作の提案資料（HTMLスライド）です。

## フォルダ構成

```
sales-deck/video-production/
├── index.html          # メインスライド（全12枚）
├── css/style.css       # スタイル
├── js/slides.js        # スライド操作
└── images/             # AI生成画像（6枚）
    ├── cover-hero.png
    ├── corporate-video.png
    ├── sns-short-video.png
    ├── event-video.png
    ├── workflow-process.png
    └── quality-comparison.png
```

## 使い方

### ブラウザで開く
```bash
cd sales-deck/video-production
python3 -m http.server 8081
```
→ `http://localhost:8081/` にアクセス

### 操作
- **→ / スペース** … 次のスライド
- **←** … 前のスライド
- **全画面表示** … 右上ボタン（プレゼン用）

## スライド内容

1. 表紙
2. なぜ今、映像が必要か
3. 選ばれる理由
4. サービス一覧
5. 企業PR映像
6. SNSショート動画
7. イベント映像
8. 制作フロー
9. 品質比較
10. 料金プラン
11. 導入事例
12. お問い合わせ（CTA）

## カスタマイズ

- 会社名・連絡先：`index.html` の表紙・最終スライドを編集
- 料金：`index.html` の Pricing セクション
- 画像：`images/` フォルダ内のPNGを差し替え

## 注意

- 事例数値・連絡先はサンプルです。実際の営業前に差し替えてください。
- 印刷する場合はブラウザの「PDFに保存」が利用できます。
