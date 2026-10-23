# 確かめられる小さな作業から Codex を始める

**翻訳の範囲：**この入門ガイドは 5 言語で読めます。60 本の詳しいレッスン、実行用の練習ファイル、ソースのプレビュー、理解度チェックは英語のままです。ガイドの言語を選んでも、コース全体が日本語になるわけではありません。

ガイド更新日：**2026 年 10 月 22 日**。製品ドキュメントの確認日：**2026 年 10 月 21 日**。利用できる機能は、クライアントのバージョン、OS、アカウント、組織の設定によって異なる場合があります。

[English](../en/README.md) · [Tiếng Việt](../vi/README.md) · [中文](../zh/README.md) · [日本語](../ja/README.md) · [Українська](../uk/README.md)

## 1. 自分で確認できるプロジェクトを開く

Codex は、プロジェクトのファイルを読み、変更を提案し、利用可能なツールを使うコーディングエージェントです。まずはデスクトップアプリを使うと、プロジェクト、チャット、プレビューを同じ作業場所で扱えます。インストールとサインインは[公式アプリの案内](https://learn.chatgpt.com/docs/app)に従ってください。すでに導入済みなら、まず現在の環境を確認します。Codex を選び、練習専用のフォルダーを開きます。サインインできたことだけでは、正しいフォルダーが開いている証拠にはなりません。

[最初のレッスン](https://builtbyhuy.github.io/codex-howto/#lesson/s01-01)を開き、[Orbit Notes](https://builtbyhuy.github.io/codex-howto/labs/project-workflow.zip) をダウンロードして展開してください。ZIP は展開先の下に `labs/project-workflow/` を保持します。その練習フォルダーで実行します。

```text
node create-workspace.cjs
```

既存の Node.js 20+ が必要です。新しい一時フォルダーのパスが表示されるので、その場所を正確に Codex で開きます。Node がなければ、ファイル管理アプリで `starter/` をコピーできます。ただし、コードの検証はまだ実行していないと記録してください。個人の文書は練習に含めません。

## 2. 編集の前に、根拠を確かめる

表示されたフォルダーを開いたら、次のように依頼します。

```text
読み取りだけを行ってください。実際の作業ディレクトリを確認し、README.md、AGENTS.md、notes.json を読んでください。プロジェクトの目的、4 件のノート ID、デプロイ先 URL の記載があるかを報告してください。README のテスト手順を採用する前に package.json の有無を調べてください。ファイルの編集やインストールはしないでください。
```

回答を自分でもファイルと照合します。架空のノート ID は `n1`、`n2`、`n3`、`n4` です。デプロイ先 URL の記載はありません。初期 README には `npm test` とありますが、`package.json` は存在しません。これは、根拠のない手順を見抜くために意図的に入れた不整合です。正しい回答は矛盾を指摘します。URL を作り上げたり、不整合を隠すために依存関係を追加したりするべきではありません。

`AGENTS.md` はプロジェクト向けの指示を書くファイルです。ただし、その存在だけでは、すべてのクライアントが発見して指示に従ったと証明できません。作業ディレクトリが違っていたら、編集を進める前に正しい場所を開き直してください。

## 3. 一つの不具合を直して検証する

自分の練習用コピーで、変更前の結果を記録します。

```text
node --test checks.cjs
node cli.cjs REVIEW
```

想定結果は **4 件成功、2 件失敗**です。検索は部分一致で、大文字と小文字を区別せず、検索語の前後の空白を無視する必要があります。Codex に `notes.cjs` の修正を依頼し、元のノートオブジェクトと並び順を保持させます。README.md の検証手順も実際のコマンドに直します。`notes.json`、`checks.cjs`、`WORK-NOTE.md` は変更しません。その後、次を実行します。

```text
node --test checks.cjs
node cli.cjs "  REVIEW  "
```

目標は **6 件すべて成功**し、`n1: Review launch checklist` と `n3: Review documentation` が表示されることです。変更したファイルも自分で開いてください。「完了しました」という回答はテスト結果の代わりになりません。失敗が残る場合は実際の出力を渡し、関係する最小範囲の修正を依頼します。失敗するテストを消したり、プロジェクト全体を解答で上書きしたりしません。練習パックの解答と評価基準は、自分で試した後に使います。

次は、README に加えた有用な段落を残しながら、気に入らない見出しの変更だけを戻してみます。これが範囲を絞った復元です。別のチャットを開いてもファイルは元に戻りません。Git が導入済みなら、任意の練習でステージング領域の基準と差分を確認できます。別のコミット実演では、継続的に残る履歴を学びます。ステージングの状態とコミットは違う種類のチェックポイントです。

## 4. 10 モジュールを順番に学ぶ

コースは合計 **60 レッスン**で、次の順序です。Skill は再利用できる指示のパッケージ、MCP はツールやデータを接続する規約、サブエージェントは委任された仕事を受け持つエージェントです。Hook は対応するイベントを処理し、plugin は関連する機能をまとめて配布します。後のレッスンで、それぞれの設定と利用条件を説明します。

| 段階 | モジュールとレッスン数 |
| --- | --- |
| 基礎 | [コマンドと初回セッション](https://builtbyhuy.github.io/codex-howto/#lesson/s01-01) — 6、[プロジェクト指示とメモリ](https://builtbyhuy.github.io/codex-howto/#lesson/s02-01) — 5、[復元と Git](https://builtbyhuy.github.io/codex-howto/#lesson/s08-01) — 5、[CLI](https://builtbyhuy.github.io/codex-howto/#lesson/s10-01) — 5 |
| 中級 | [Skills](https://builtbyhuy.github.io/codex-howto/#lesson/s03-01) — 6、[Hooks](https://builtbyhuy.github.io/codex-howto/#lesson/s06-01) — 7、[MCP](https://builtbyhuy.github.io/codex-howto/#lesson/s05-01) — 6、[サブエージェント](https://builtbyhuy.github.io/codex-howto/#lesson/s04-01) — 7 |
| 応用 | [高度な機能](https://builtbyhuy.github.io/codex-howto/#lesson/s09-01) — 7、[Plugins](https://builtbyhuy.github.io/codex-howto/#lesson/s07-01) — 6 |

各レッスンには、目標、解説、例、課題、確認すべき証拠、参考解答、理解度チェックがあります。解答を開く前に課題を試してください。学習時間の表示は見積もりであり、習熟を保証するものではありません。

## 5. 七つの練習パックが示す範囲を知る

[練習ライブラリ](https://builtbyhuy.github.io/codex-howto/#labs)では七つのパックを個別に取得できます。`project-workflow` は初めてのプロジェクトと復元、`cli-pipeline` は子プロセスのイベントと抽出レポートの検証、`skill-workflow` は再利用できるレビュー skill と決定的な補助プログラム、`mcp-workbench` は実際のローカル JSON-RPC 通信、`delegation-capstone` は二つの担当作業の統合を扱います。`hook-policy` は制限付きイベントの再生と成果物の根拠確認、`workflow-plugin` は skill、ツール、接続用の構成要素をまとめる練習です。

ローカルプログラムは実際に動きますが、架空のデータ、合成イベント、模擬的な作業委任にはその旨が明記されています。補助プログラムのテスト成功は、Codex が skill を呼び出した、MCP ツールを選んだ、サブエージェントを起動した、hook を有効化したという証明にはなりません。任意の実クライアント向け手順で、それぞれ別に観察します。各 README を読み、新しいコピーを使い、意図的に失敗する練習の初期状態と、成功すべき参考実装の検証を区別してください。

## 6. アプリ、CLI、IDE を区別する

**アプリ**ではプロジェクト、チャット、変更レビューのパネルを使います。**CLI** はターミナルの独立したクライアントで、現在のディレクトリとオプションが重要です。**IDE 拡張機能**はエディターのワークスペースで動くため、そのルートと拡張機能の操作を確認します。CLI コマンドをアプリのチャットに貼ればアプリを操作できる、とは考えないでください。

導入済みのクライアントで、実際のメニューと対応機能を確認し、該当する手順を使います。API キーや機密情報を練習の依頼に含めません。[CLI 文書](https://learn.chatgpt.com/docs/codex/cli)、[認証](https://learn.chatgpt.com/docs/auth)、[実行権限](https://learn.chatgpt.com/docs/agent-approvals-security)も参照してください。

## 7. 進捗の保存とローカル起動

学習アカウントは不要です。レッスンを開くと進捗が記録され、作業を確認してから完了にします。進捗とクイズの選択肢は、そのブラウザーと配信元に保存されます。ローカル版と公開サイトは別々の記録です。端末の変更やブラウザーのデータ削除前に Source library で進捗をエクスポートし、移行先でインポートしてください。プライベートブラウズや保存の制限では、継続保存できない場合があります。ウェブサイト自身がターミナルの例を実行することはありません。

Git と Node.js 20+ が導入済みなら、次の手順で起動できます。

```text
git clone https://github.com/builtbyhuy/codex-howto.git
cd codex-howto
node scripts/server.cjs
```

`http://127.0.0.1:4173/` を開き、ターミナルは起動したままにします。終了は Ctrl+C です。パッケージのインストールやフレームワークのビルドは不要です。index.html を直接開かず、サーバー経由で利用します。対話型の閲覧には JavaScript が必要です。

## 出典、フィードバック、再利用

この独立したコミュニティガイドは、OpenAI、Anthropic、参照元の作者と提携しておらず、認定資格も提供しません。学習の構成は [Claude How-To](https://luongnv.com/claude-howto/) を参考にしていますが、Codex の手順は確認済みの機能に基づき書き直しています。[ソースリポジトリ](https://github.com/builtbyhuy/codex-howto)には出典と[第三者の権利表示](https://github.com/builtbyhuy/codex-howto/blob/main/THIRD-PARTY-NOTICES.md)があります。元の [MIT 表示](https://github.com/builtbyhuy/codex-howto/blob/main/assets/licenses/claude-howto-MIT.txt)、フォント、アイコン、Mermaid、schema の個別ライセンスを保持しています。公開されていることは、独自の教材全体に新たな一括ライセンスを与える意味ではありません。

[GitHub Issues](https://github.com/builtbyhuy/codex-howto/issues/new)で問題を報告するときは、レッスン ID、クライアントとバージョン、機密情報を除いた症状を書いてください。秘密鍵や個人のパスを削除します。製品と教材に違いがある場合は、リンク先の公式文書を確認してください。確認日は証拠の時点を示すもので、将来のバージョンの保証ではありません。
