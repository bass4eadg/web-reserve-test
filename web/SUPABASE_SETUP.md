# Supabaseセットアップガイド

## 1. アカウント作成とプロジェクト作成

1. [Supabase](https://app.supabase.com/) にアクセス
2. GitHubアカウントでサインアップ
3. 「New project」をクリック
4. プロジェクト情報を入力：
   - Name: `web-reserve-system`
   - Database Password: 強力なパスワードを設定
   - Region: `Tokyo (ap-northeast-1)` を選択
5. 「Create new project」をクリック
6. プロジェクトの準備完了まで数分待機

## 2. データベース設定

プロジェクトが作成されたら：

1. 左メニューの「SQL Editor」をクリック
2. 新しいクエリを作成
3. `supabase-setup.sql` の内容をコピー&ペースト
4. 「Run」ボタンをクリックしてテーブルを作成

## 3. API キーの取得 ✅

1. 左メニューの「Settings」→「API」をクリック
2. 「Create new API key」をクリック（必要に応じて）
3. 以下の値をコピーしてメモしておく：
   - **Project URL**: `https://xxxxx.supabase.co` の形式
   - **Publishable API key**: `sb_publishable_...` で始まる文字列
   
   ※ 古いプロジェクトでは「anon public key」（`eyJhbGciOiJIUzI1...`形式）の場合もあります

⚠️ **重要**: 
- **Publishable API key**（`sb_publishable_...`）を使用してください（フロントエンド用）
- **service_role key**は絶対に使用しないでください（サーバー専用で危険）

💡 **補足**: `sb_publishable_`で始まるキーが最新の推奨形式です

## 4. 環境変数の設定

プロジェクトルート（`/Users/hibiki/Documents/Projects/web_reserve/web/`）に `.env.local` ファイルを作成し、以下を記入：

```bash
# 以下の値を実際の値に置き換えてください
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **注意**: 
- `xxxxx` 部分は実際のプロジェクトIDに置き換える
- anon keyは完全な文字列をコピーする
- `.env.local` ファイルは `.gitignore` に含まれているので、Gitにコミットされません

## 5. サービス切り替え ✅

アプリケーションでSupabaseを使用するように変更：

### App.tsx を更新 ✅
```typescript
// 変更前
import { localStorageService } from './services/localStorageService';

// 変更後  
import { reservationService } from './services/reservationService';
```

```typescript
// 変更前
const result = await localStorageService.createReservation(fullReservation);

// 変更後
const result = await reservationService.createReservation(fullReservation);
```

### DateTimeSelection.tsx を更新 ✅
```typescript
// 変更前
import { localStorageService } from '../services/localStorageService';

// 変更後
import { reservationService } from '../services/reservationService';
```

```typescript
// 変更前
const slots = await localStorageService.getAvailableTimeSlots(newValue.toDate());

// 変更後  
const slots = await reservationService.getAvailableTimeSlots(newValue.toDate());
```

## 6. 動作確認

1. **開発サーバーを再起動**:
   ```bash
   # ターミナルでCtrl+Cで停止してから
   yarn dev
   ```

2. **予約機能をテスト**:
   - 日時を選択
   - 顧客情報を入力  
   - 予約を確定

3. **Supabaseダッシュボードで確認**:
   - 左メニューの「Table Editor」をクリック
   - `customers` と `reservations` テーブルにデータが追加されているか確認

## 7. 無料プランの制限

Supabase無料プランの主な制限：
- **データベース**: 500MB
- **帯域幅**: 5GB/月  
- **API リクエスト**: 50,000回/月
- **認証ユーザー**: 50,000人/月

店舗予約システムとしては十分な容量です！

## トラブルシューティング

### よくある問題：

1. **「環境変数が読み込まれない」**
   ```bash
   # サーバーを再起動
   yarn dev
   ```

2. **「Supabase接続エラー」**
   - URL と API キーが正しいか確認
   - `.env.local` ファイルの場所が正しいか確認

3. **「テーブルが見つからない」**
   - SQL Editor で `supabase-setup.sql` が正常実行されたか確認

## 防音室予約システム - 1時間実装版

**実装する機能（最小限）**：

### 顧客側
✅ 日付選択
✅ 予約時間選択（開始時間 → 終了時間）
✅ 代表者情報入力（氏名 + 学籍番号のみ）
✅ 予約確定

### 管理者側
✅ 予約一覧表示（ログインなし・シンプル表示）

**削除した機能（後回し）**：
❌ 複数人の情報入力
❌ メール送信機能
❌ 管理者ログイン機能
❌ 月別表示・高度な管理機能

