# Flutter app integration

This directory is reserved for the existing Trading Flutter application. The inspected `Trading` and `trading-01` GitHub repositories were empty, and the local project reference directory contained no source files. Restore the actual app here before changing client behavior or expecting an APK from CI.

Once `pubspec.yaml` is present, GitHub Actions runs `flutter pub get` and builds a release APK. Keep signing keys and credentials in GitHub Actions secrets; do not commit them.
