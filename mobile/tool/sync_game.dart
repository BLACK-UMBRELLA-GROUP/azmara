// Generated packaging copies only. Edit the canonical prototype, not assets/game.
import 'dart:io';

Future<List<String>> _readRuntimeManifest(Directory prototype) async {
  final manifest = File('${prototype.path}/runtime-manifest.txt');
  if (!manifest.existsSync() || FileSystemEntity.isLinkSync(manifest.path)) {
    throw StateError('Canonical runtime manifest is missing or linked.');
  }
  final files = (await manifest.readAsLines())
      .map((line) => line.trim())
      .where((line) => line.isNotEmpty)
      .toList(growable: false);
  final invalid = files.where(
    (relative) =>
        relative.startsWith('/') ||
        relative.contains('\\') ||
        relative
            .split('/')
            .any(
              (segment) => segment.isEmpty || segment == '.' || segment == '..',
            ),
  );
  if (files.length != 76 ||
      files.toSet().length != files.length ||
      invalid.isNotEmpty) {
    throw StateError(
      'Canonical runtime manifest must contain 76 safe unique paths.',
    );
  }
  return files;
}

Future<bool> _sameBytes(File first, File second) async {
  if (await first.length() != await second.length()) return false;
  final a = await first.open();
  final b = await second.open();
  try {
    const chunkSize = 64 * 1024;
    while (true) {
      final left = await a.read(chunkSize);
      final right = await b.read(chunkSize);
      if (left.length != right.length) return false;
      if (left.isEmpty) return true;
      for (var index = 0; index < left.length; index++) {
        if (left[index] != right[index]) return false;
      }
    }
  } finally {
    await a.close();
    await b.close();
  }
}

Future<void> main() async {
  final project = Directory.current.absolute;
  final prototype = Directory('${project.path}/prototype');
  final mobile = Directory('${project.path}/mobile');
  if (!File('${prototype.path}/index.html').existsSync() ||
      !File('${mobile.path}/pubspec.yaml').existsSync()) {
    throw StateError('Run from the canonical AZMARA project root.');
  }
  final runtimeFiles = await _readRuntimeManifest(prototype);

  final bridge = File('${mobile.path}/native-bootstrap.js');
  if (!bridge.existsSync() || FileSystemEntity.isLinkSync(bridge.path)) {
    throw StateError('Native save bootstrap must be a regular local file.');
  }

  final output = Directory('${mobile.path}/assets/game');
  final staging = Directory('${mobile.path}/assets/game.sync.tmp');
  if (staging.existsSync()) await staging.delete(recursive: true);
  await staging.create(recursive: true);

  var totalBytes = 0;
  try {
    for (final relative in runtimeFiles) {
      final source = File('${prototype.path}/$relative');
      if (!source.existsSync() || FileSystemEntity.isLinkSync(source.path)) {
        throw StateError('Missing or linked canonical runtime file: $relative');
      }
      final target = File('${staging.path}/$relative');
      await target.parent.create(recursive: true);
      if (relative == 'index.html') {
        final html = await source.readAsString();
        final appScript = RegExp(
          r'<script\s+src="app\.js(?:\?[^\"]*)?"\s+defer></script>',
        );
        if (appScript.allMatches(html).length != 1) {
          throw StateError('Expected exactly one canonical app.js script.');
        }
        await target.writeAsString(
          html.replaceFirst(
            appScript,
            '<script src="native-bootstrap.js" defer></script>',
          ),
        );
      } else {
        await source.copy(target.path);
        if (!await _sameBytes(source, target)) {
          throw StateError('Copied runtime file did not verify: $relative');
        }
      }
      totalBytes += await target.length();
    }

    final bridgeTarget = File('${staging.path}/native-bootstrap.js');
    await bridge.copy(bridgeTarget.path);
    if (!await _sameBytes(bridge, bridgeTarget)) {
      throw StateError('Copied native bootstrap did not verify.');
    }
    totalBytes += await bridgeTarget.length();

    final actual = <String>[];
    await for (final entity in staging.list(
      recursive: true,
      followLinks: false,
    )) {
      if (entity is Link) {
        throw StateError('Generated native runtime contains a link.');
      }
      if (entity is File) {
        actual.add(entity.path.substring(staging.path.length + 1));
      }
    }
    actual.sort();
    final expected = [...runtimeFiles, 'native-bootstrap.js']..sort();
    if (actual.length != expected.length ||
        !List.generate(
          actual.length,
          (index) => index,
        ).every((index) => actual[index] == expected[index])) {
      throw StateError('Generated native runtime does not match its manifest.');
    }

    if (output.existsSync()) await output.delete(recursive: true);
    await staging.rename(output.path);
  } catch (_) {
    if (staging.existsSync()) await staging.delete(recursive: true);
    rethrow;
  }

  stdout.writeln(
    'Bundled 76 canonical game files plus native save bootstrap '
    '($totalBytes bytes; no extras).',
  );
}
