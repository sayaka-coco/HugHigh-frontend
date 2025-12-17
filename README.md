# HugHigh Frontend 
  
Next.js を使用したログイン画面とダッシュボード   

## 🚀 クイックスタート

### 1. リポジトリのクローン（初回のみ）

```bash
git clone https://github.com/sayaka-coco/HugHigh-frontend.git
cd HugHigh-frontend-main
```

### 2. 依存パッケージのインストール

```bash
npm install
# または
yarn install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env.local`を作成:

```bash
# Windows
copy .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

`.env.local` ファイルを編集し、バックエンドAPIのURLを設定:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**重要:** `.env.local`ファイルは機密情報を含むため、Gitにコミットされません。

### 4. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

アプリケーションは http://localhost:3000 で起動します。

## ビルド

本番環境用のビルド:

```bash
npm run build
npm run start
```

## 画面構成

- `/` - ルートページ（自動リダイレクト）
- `/auth/login` - ログイン画面
- `/student/home` - 生徒用ホーム画面
- `/teacher/home` - 先生用ホーム画面

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React OAuth Google
- Axios
- js-cookie

## ディレクトリ構造

```
src/
├── app/
│   ├── auth/login/       # ログイン画面
│   ├── student/home/     # 生徒ホーム
│   ├── teacher/home/     # 先生ホーム
│   ├── layout.tsx        # ルートレイアウト
│   ├── page.tsx          # ホームページ
│   └── globals.css       # グローバルスタイル
├── lib/
│   └── api.ts            # API通信ロジック
└── types/
    └── index.ts          # TypeScript型定義
```
