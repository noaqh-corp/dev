

開発フロー含めた問題

現状の課題
- レビューがしにくい
    - レビューをこちらにフィードバックする機能がない。
- ちょっと全部Publicは良くないかも
- 動いているのかわかりにくい
    → docker追加
- updateがわかりにくい

AGENTS.md、CLAUDE.mdに規定のプロンプトを追加する。以下の間に規定のプロンプトをインストールするようにする。間のプロンプトのみreplaceする。以下がなければ末尾に追加する。CLAUDEは~/.claude/CLAUDE.md、AGENTSは~/.codex/AGENTS.mdに追加する。agents/prompt.mdの中身をreplaceする。チーム内で共通のプロンプトを簡単に追加できるようにする。
<!-- START NOAQH PROMPT -->
<!-- END NOAQH PROMPT -->


