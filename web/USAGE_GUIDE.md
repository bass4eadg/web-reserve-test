# 店舗予約システム - 使い方ガイド

## 🎯 現在の状況

✅ **LocalStorage版**が動作中  
- データはブラウザのLocalStorageに保存
- ページをリロードしてもデータが保持される
- 複数のタブ間でデータが共有される

## 🚀 テスト手順

### 1. 基本的な予約フロー
1. **日時選択**：カレンダーから日付を選択
2. **人数選択**：1〜8名を選択
3. **時間選択**：利用可能な時間スロットをクリック
4. **顧客情報入力**：名前、メール、電話番号を入力
5. **予約確認**：内容を確認して「予約を確定する」をクリック

### 2. データの確認方法
- **ブラウザの開発者ツール**を開く（F12）
- **Application** タブ → **Local Storage** → **localhost:5173**
- `reservations` と `customers` のデータが表示される

### 3. 時間スロットの動作確認
- 同じ日時で複数回予約を取る
- 人数が店舗の最大収容人数（20名）に近づくと時間スロットが予約不可になる

## 📱 次のステップ：Supabase導入

### Supabase導入のメリット
- ✅ **リアルタイム同期**：複数ユーザー間でデータが即座に同期
- ✅ **永続的なデータ保存**：ブラウザを閉じてもデータが残る
- ✅ **スケーラビリティ**：多数のユーザーに対応
- ✅ **管理画面**：予約データをWeb上で管理

### Supabase設定手順（簡単版）

1. **アカウント作成**
   ```
   https://app.supabase.com/ にアクセス
   GitHubでサインアップ
   ```

2. **プロジェクト作成**
   ```
   New Project → 名前入力 → パスワード設定 → Tokyo選択
   ```

3. **データベース設定**
   ```
   SQL Editor → New Query → supabase-setup.sqlの内容をペースト → Run
   ```

4. **環境変数設定**
   ```bash
   # プロジェクトルートに .env.local を作成
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

5. **サービス切り替え**
   ```typescript
   // App.tsx と DateTimeSelection.tsx で
   import { localStorageService } from './services/localStorageService';
   // ↓
   import { reservationService } from './services/reservationService';
   ```

## 🔧 トラブルシューティング

### よくある問題

1. **「予約が保存されない」**
   - ブラウザのLocalStorageが無効になっている可能性
   - プライベートブラウジングモードの場合は制限される

2. **「時間スロットが表示されない」**
   - 日付を選択しているか確認
   - コンソールエラーをチェック

3. **「エラーが表示される」**
   - ブラウザの開発者ツール（F12）でコンソールを確認
   - エラーメッセージを確認

### デバッグ方法
```javascript
// ブラウザのコンソールでLocalStorageを確認
console.log('予約データ:', JSON.parse(localStorage.getItem('reservations') || '[]'));
console.log('顧客データ:', JSON.parse(localStorage.getItem('customers') || '[]'));

// データをクリア
localStorage.removeItem('reservations');
localStorage.removeItem('customers');
```

## 🎉 動作確認完了後

Supabaseの設定に進むか、現在のLocalStorage版をそのまま使用するか選択できます。

**LocalStorage版の制限**：
- データはブラウザローカルのみ
- 管理者画面なし
- リアルタイム同期なし

**Supabase版の利点**：
- クラウドデータベース
- 管理者画面可能
- リアルタイム同期
- 複数デバイス対応
