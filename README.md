# web-reserve-test
防音室予約システムのテスト

## セットアップ

### 1. 依存関係のインストール
```bash
cd web
npm install
```

### 2. 環境変数の設定（重要）
1. `web/.env.example` をコピーして `web/.env` を作成
2. Supabaseプロジェクトから以下の値を取得して設定:
   - `VITE_SUPABASE_URL`: プロジェクトURL
   - `VITE_SUPABASE_ANON_KEY`: パブリックAPIキー

⚠️ **セキュリティ注意**: `.env` ファイルは絶対にGitにコミットしないでください

### 3. アプリケーションの起動
```bash
cd web
npm run dev
```
