// Generated packaging copies only. Edit the canonical prototype, not assets/game.
import 'dart:io';

Future<void> main() async {
  final project = Directory.current.absolute;
  if (!File('${project.path}/prototype/index.html').existsSync() ||
      !File('${project.path}/mobile/pubspec.yaml').existsSync()) {
    throw StateError('Run from the canonical AZMARA project root.');
  }
  const files = [
    'index.html', 'styles.css', 'app.js',
    'assets/azmara-starting-terrain-v3.png',
    'assets/azmara-town-hall-v3.png',
    'assets/azmara-empty-plot-v3.png',
  ];
  for (final relative in files) {
    final source = File('${project.path}/prototype/$relative');
    if (FileSystemEntity.isLinkSync(source.path)) {
      throw StateError('Refusing symlink: $relative');
    }
    final target = File('${project.path}/mobile/assets/game/$relative');
    await target.parent.create(recursive: true);
    if (relative == 'index.html') {
      final html = await source.readAsString();
      const needle = '<script src="app.js" defer></script>';
      if (needle.allMatches(html).length != 1) {
        throw StateError('Expected exactly one canonical app.js script.');
      }
      await target.writeAsString(html.replaceFirst(needle,
          '<script src="native-bootstrap.js" defer></script>'));
    } else {
      await source.copy(target.path);
    }
  }
  final bridge = File('${project.path}/mobile/native-bootstrap.js');
  if (!bridge.existsSync() || FileSystemEntity.isLinkSync(bridge.path)) {
    throw StateError('Native save bootstrap must exist before bundling.');
  }
  await bridge.copy('${project.path}/mobile/assets/game/native-bootstrap.js');
  stdout.writeln('Bundled six canonical game files plus native save bootstrap.');
}
