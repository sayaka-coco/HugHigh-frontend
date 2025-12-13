# GitHub リポジトリからのセットアップ手順

## 📦 リポジトリ情報

- **リポジトリURL:** https://github.com/sayaka-coco/RFP-ask_test-front.git
- **ブランチ:** main

## 🚀 クローンとセットアップ

### 手順1: リポジトリのクローン

```bash
git clone https://github.com/sayaka-coco/RFP-ask_test-front.git
cd RFP-ask_test-front
```

### 手順2: 依存パッケージのインストール

```bash
npm install
```

### 手順3: 環境変数の設定

`.env.example`をコピーして`.env.local`を作成:

```bash
# Windows
copy .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

`.env.local`の内容:

```bash
# バックエンドAPIのURL（ローカル開発用）
NEXT_PUBLIC_API_URL=http://localhost:8000

# Google OAuth Client ID（オプション）
# Google Cloudコンソールから取得してください
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 手順4: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## ⚙️ バックエンドの準備

このフロントエンドは、バックエンドAPI（FastAPI）に依存しています。

### バックエンドのセットアップ

バックエンドは別リポジトリまたはローカルにある必要があります。

1. バックエンドのディレクトリに移動
2. 依存パッケージをインストール
3. サーバーを起動

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python seed_data.py
uvicorn main:app --reload
```

バックエンドが http://localhost:8000 で起動していることを確認してください。

## 🔐 セキュリティ

**重要:** 以下のファイルは機密情報を含むため、Gitにコミットされません:

- `.env.local` - 環境変数（ローカル開発用）
- `node_modules/` - NPMパッケージ
- `.next/` - ビルドファイル

詳細は [SECURITY.md](SECURITY.md) を参照してください。

## 🧪 テストアカウント

バックエンドに以下のテストアカウントが登録されている必要があります:

| 役割 | メールアドレス | パスワード |
|-----|--------------|-----------|
| 生徒 | student1@example.com | password123 |
| 先生 | teacher1@example.com | password123 |

## 📁 プロジェクト構造

```
RFP-ask_test-front/
├── src/
│   ├── app/
│   │   ├── auth/login/      # ログイン画面
│   │   ├── student/home/    # 生徒ホーム画面
│   │   ├── teacher/home/    # 先生ホーム画面
│   │   ├── layout.tsx       # ルートレイアウト
│   │   ├── page.tsx         # トップページ
│   │   └── globals.css      # グローバルスタイル
│   ├── lib/
│   │   └── api.ts           # API通信ロジック
│   └── types/
│       └── index.ts         # TypeScript型定義
├── .env.example             # 環境変数テンプレート
├── .env.local              # 環境変数（Git除外）
├── .gitignore              # Git除外設定
├── package.json            # NPM設定
├── README.md               # プロジェクト説明
├── SECURITY.md             # セキュリティ情報
└── GITHUB_SETUP.md         # このファイル
```

## 🛠️ 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# Lintチェック
npm run lint
```

## 🌐 本番デプロイ

### Vercelへのデプロイ

1. Vercelアカウントでリポジトリをインポート
2. 環境変数を設定:
   - `NEXT_PUBLIC_API_URL`: 本番バックエンドのURL
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth Client ID（オプション）
3. デプロイ実行

### その他のプラットフォーム

Netlify、Render、AWS Amplifyなどでも同様にデプロイ可能です。

## ❓ トラブルシューティング

### ログインできない

1. バックエンドが起動しているか確認: http://localhost:8000/health
2. `.env.local`の`NEXT_PUBLIC_API_URL`が正しいか確認
3. ブラウザのコンソール（F12）でエラーを確認

### "Cannot find module" エラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### ポート3000が使用中

```bash
# 別のポートで起動
PORT=3001 npm run dev
```

## 📞 サポート

問題が解決しない場合は、GitHubのIssuesで報告してください。
